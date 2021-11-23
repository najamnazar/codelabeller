import { Controller, Get } from '@nestjs/common';
import { FileUploadJobService } from './file-upload-job.service';
import { ProjectFileUploadJob } from './project-file-upload-job.entity';

@Controller('file-upload-job')
export class FileUploadJobController {
  constructor(private readonly fileUploadJobService: FileUploadJobService) { }

  @Get("/")
  async getAllActive(): Promise<ProjectFileUploadJob[]> {
    const jobs = await this.fileUploadJobService.getAll();

    for (const job of jobs) {
      job['progressRatio'] = job.numTargetTasks != 0 ? (job.numDoneTasks / job.numTargetTasks * 100).toFixed(2) : '-';
    }

    return jobs;
  }
}
