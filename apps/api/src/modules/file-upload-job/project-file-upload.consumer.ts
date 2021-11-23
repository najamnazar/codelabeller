import { Processor, Process, OnQueueCompleted, OnQueueProgress, OnQueueActive, OnQueueFailed } from '@nestjs/bull';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { getConnectionManager } from 'typeorm';
import { Job } from 'bull';
import { join } from 'path';
import * as StreamZip from 'node-stream-zip';
import * as md5 from 'md5';
import * as md5ToUuid from 'md5-to-uuid';
import { File } from '../file/file.entity';
import { ProjectService } from '../project/project.service';
import { ResponseService } from '../response/response.service';
import { ProjectFileUploadJob } from './project-file-upload-job.entity';
import { ProjectFileUploadJobLine } from './project-file-upload-job-line.entity';
import { OptionService } from '../option/option.service';

@Processor('project')
export class ProjectFileUploadConsumer {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  constructor(private projectService: ProjectService, private responseService: ResponseService, private optionService: OptionService) { }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Job ${job.id} of type ${job.name} has started.`,
    );
  }

  @OnQueueProgress()
  async onProgress(job: Job, result: any) {
    console.log(
      `Job ${job.id} of type ${job.name} progress: ${result.finished} / ${result.target}`,
    );

    try {
      await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ProjectFileUploadJob)
      .update(job.id, { numDoneTasks: result.finished });
    } finally {}
  }

  @OnQueueCompleted()
  async onComplete(job: Job, result: any) {
    console.log(
      `Finished processing job ${job.id} of type ${job.name}.`,
    );

    await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ProjectFileUploadJob)
      .update(job.id, { isCompleted: true });
  }

  @OnQueueFailed()
  async onError(job: Job, error: Error) {
    const jobLine = {
      isDone: true,
      isRejected: false,
      parentJob: { id: job.id },
      messages: [`Upload job failed due to the following error: ${error.message}`]
    } as ProjectFileUploadJobLine;

    await getConnectionManager()
    .get(this.dbConnName)
    .getRepository(ProjectFileUploadJobLine)
    .save(jobLine);

    await getConnectionManager()
    .get(this.dbConnName)
    .getRepository(ProjectFileUploadJob)
    .update(job.id, { isCompleted: true, isFailed: true });
  }

  @Process('projectFileUpload')
  async processProjectFileUpload(job: Job<ProjectFileUploadJob>) {
    const currentProject = await this.projectService.getProjectWithFilesOnly(job.data.project.id);

    // Get default settings for file uploads
    const enableFile = await OptionService.getOption<boolean>('uploadedFilesEnabledByDefault', true);
    const acceptingResponses = await OptionService.getOption<boolean>('uploadedFilesAcceptingResponsesByDefault', true);
    const numRequiredResponses = await OptionService.getOption<number>('uploadedFilesNumRequiredResponsesByDefault', 3);

    if (!currentProject) {
      throw new Error("Upload job was not associated with a project.");
    }

    const existingFiles: { [key: string]: File } = currentProject.files.reduce((object, file) => {
      const fullPath = [currentProject.name, file.path, file.name].join('/');
      object[fullPath] = file;
      return object;
    }, {});

    const zipStream = new StreamZip.async({ file: join(job.data.archiveFilePath, job.data.archiveFileName) });
    const fileEntries = await zipStream.entries();
    const entriesCount = Object.values(fileEntries).length;

    await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ProjectFileUploadJob)
      .update(job.id, {numTargetTasks: entriesCount});

    let count = 0;
    for (const fileEntry of Object.values(fileEntries)) {
      count++;

      // If current file is a directory, create the directory on disk if it does not exist
      const currentPath = join(process.env.CORPUS_ABSOLUTE_PATH, fileEntry.name);
      if (fileEntry.isDirectory) {
        if (!existsSync(currentPath)) {
          mkdirSync(currentPath, { recursive: true });
        }

        continue;
      }

      job.progress({ finished: count, target: entriesCount });

      // Store job messages that notify the user of events related to the processing of the current upload job (each file is a separate job).
      const jobMessages: string[] = [`Job progress: ${count}/${entriesCount}`];

      const jobLine = {
        isDone: true,
        isRejected: false,
        parentJob: { id: job.id },
      } as ProjectFileUploadJobLine;

      // At this point in code, the current file is not a directory.

      // If file does not exist in the project, proceed to create it as normal.

      // Split path of current file into its constituents.
      let identifiedProject = '';
      let identifiedPath = '';
      let identifiedFileName = '';

      const splitPath = fileEntry.name.split('/');

      if (splitPath.length > 2) {
        identifiedProject = splitPath[0];
        identifiedPath = splitPath.slice(1, -1).join('/');
        identifiedFileName = splitPath[splitPath.length - 1];
      }
      else if (splitPath.length == 2) {
        identifiedProject = splitPath[0];
        identifiedFileName = splitPath[1];
      }
      else if (splitPath.length == 1) {
        identifiedFileName = splitPath[0];
      }

      // If file already exists in the project, file will not be updated if it already has responses.
      if (existingFiles[fileEntry.name]) {
        const responses = await this.responseService.getTotalResponseCountForFile(existingFiles[fileEntry.name].id);
        if (responses > 0) {
          jobMessages.push(`Cannot update file '${identifiedProject}/${identifiedPath}/${identifiedFileName}' as it already has responses.`);
          jobLine.isRejected = true;
          jobLine.messages = jobMessages ?? [];
          await this.saveJobLineInfo(jobLine);
          continue;
        }
      }

      if (!identifiedFileName.endsWith('.java')) {
        jobMessages.push('File is not of .java extension');
      }

      if (identifiedProject !== currentProject.name) {
        jobMessages.push('File is not in a root directory of the same name as the project');
      }

      try {
        // Create/update file on disk
        const fileContents = await zipStream.entryData(fileEntry.name);
        writeFileSync(currentPath, fileContents, 'utf8');
      } catch (error) {
        jobMessages.push('Unable to save file source code to server storage.');
        jobLine.isRejected = true;
        jobLine.messages = jobMessages ?? [];
        await this.saveJobLineInfo(jobLine);
        continue;
      }

      let fileToSave: File = new File();
      if (!existingFiles[fileEntry.name]) {
        // Generate the file's unique MD5 to be used as its ID, based on the file's project name, and full relative path of file within its project directory.
        // Full file path does not include CORPUS_ABSOLUTE_PATH env value, to ensure portability of corpus directory.
        const newId = md5ToUuid(md5(fileEntry.name));

        fileToSave.id = newId;
        fileToSave.path = identifiedPath;
        fileToSave.name = identifiedFileName;
        fileToSave.project = currentProject;
        jobMessages.push(`Creating file '${identifiedProject}/${identifiedPath}/${identifiedFileName}' with number of required responses = ${numRequiredResponses}.`)
      } else {
        fileToSave = existingFiles[fileEntry.name];
        jobMessages.push(`Updating file '${identifiedProject}/${identifiedPath}/${identifiedFileName}' with: # required responses = ${numRequiredResponses}, accepting responses: ${acceptingResponses}, enabled: ${enableFile}.`)
      }

      try {
        // Using manual query due to a bug with TypeORM not setting project IDs for each inserted file record correctly when saving these records in bulk.
        await getConnectionManager()
          .get(this.dbConnName)
          .query("REPLACE INTO `file`(`id`, `timeCreated`, `timeUpdated`, `path`, `name`, `numRequiredResponses`, `isAcceptingResponses`, `isActive`, `projectId`) VALUES (?, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?)",
          [fileToSave.id, fileToSave.path, fileToSave.name, numRequiredResponses, acceptingResponses, enableFile, currentProject.id]);

        jobMessages.push(`File saved sucessfully.`);
      } catch (err) {
        jobMessages.push(`Failed to save file due to an unknown error: ${err.message}`);
        jobLine.isRejected = true;
      }

      jobLine.messages = jobMessages ?? [];
      await this.saveJobLineInfo(jobLine);
    }

    // Clean up and delete uploaded archive file as its contents have all been processed/extracted to the corpus directory.
    await zipStream.close();
    unlinkSync(join(job.data.archiveFilePath, job.data.archiveFileName));
  }

  async saveJobLineInfo(jobLine: ProjectFileUploadJobLine) {
    try {
      await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ProjectFileUploadJobLine)
      .save(jobLine);
    } finally {}
  }
}
