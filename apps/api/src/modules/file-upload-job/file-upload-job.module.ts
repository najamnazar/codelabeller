import { Module } from '@nestjs/common';
import { FileUploadJobController } from './file-upload-job.controller';
import { FileUploadJobService } from './file-upload-job.service';

@Module({
  controllers: [FileUploadJobController],
  providers: [FileUploadJobService]
})
export class FileUploadJobModule {}
