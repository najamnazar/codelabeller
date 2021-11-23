import { Injectable } from '@nestjs/common';
import { getConnectionManager } from 'typeorm';
import { ProjectFileUploadJob } from './project-file-upload-job.entity';

@Injectable()
export class FileUploadJobService {
  private readonly dbConnName = process.env.DB_CONN_NAME;

  constructor() {}

  async getAll(): Promise<ProjectFileUploadJob[]> {
    const jobs = await getConnectionManager()
      .get(this.dbConnName)
      .createQueryBuilder(ProjectFileUploadJob, "uploadJob")
      .leftJoinAndSelect("uploadJob.project", "project")
      .leftJoinAndSelect("uploadJob.jobLines", "jobLines")
      .orderBy("uploadJob.timeCreated", "DESC")
      .orderBy("jobLines.timeCreated", "DESC")
      .getMany();

    return jobs;
  }
}
