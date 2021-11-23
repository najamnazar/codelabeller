import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { DeleteResult, getConnectionManager } from 'typeorm';
import { Queue } from 'bull';
import { File } from '../file/file.entity';
import { Project } from './project.entity';
import { ProjectFileUploadJob } from '../file-upload-job/project-file-upload-job.entity';

@Injectable()
export class ProjectService {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  constructor(@InjectQueue('project') private projectQueue: Queue) { }

  async getBasic(projectId: string): Promise<Project> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(Project, "project")
      .where("project.id = :pId", { pId: projectId })
      .getOne();
  }

  async getFiles(projectId: string): Promise<File[]> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(File, "file")
      .where("file.project.id = :pId", { pId: projectId })
      .andWhere("file.isActive IS TRUE")
      .getMany();
  }

  async getAllProjects(): Promise<Project[]> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(Project, "project")
      .leftJoinAndSelect("project.files", "files")
      .leftJoinAndSelect("files.responses", "responses")
      .loadRelationCountAndMap("project.fileCount", "project.files")
      .getMany();
  }

  async getProjectWithFilesOnly(projectId: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(Project, "project")
      .leftJoinAndSelect("project.files", "files")
      .where("project.id = :pId", { pId: projectId })
      .getOne();
  }

  async getProjectWithName(projectName: string) {
    return await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(Project, "project")
      .where("project.name = :pName", { pName: projectName })
      .getOne();
  }

  async saveProject(project: Project): Promise<Project> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Project)
      .save(project);
  }

  async deleteProject(projectId: string): Promise<DeleteResult> {
    return await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(Project)
      .delete(projectId);
  }

  async uploadProjectFiles(projectId: string, archiveFilePath: string, archiveFileName: string) {
    let job = new ProjectFileUploadJob();

    job.project = await this.getBasic(projectId);
    job.archiveFilePath = archiveFilePath;
    job.archiveFileName = archiveFileName;

    job.jobId = ((await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ProjectFileUploadJob)
      .count()) + 1).toString();

    job = await getConnectionManager()
      .get(this.dbConnName)
      .getRepository(ProjectFileUploadJob)
      .save(job);

    await this.projectQueue.add('projectFileUpload', job, { jobId: job.id });

    return job.jobId;
  }
}
