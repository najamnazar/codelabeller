import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from '../file/file.module';
import { ResponseModule } from '../response/response.module';
import { ProjectFileUploadConsumer } from '../file-upload-job/project-file-upload.consumer';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { OptionModule } from '../option/option.module';

@Module({
  imports: [
    FileModule,
    ResponseModule,
    OptionModule,
    MulterModule.register({
      dest: process.env.TEMP_UPLOADS_ABSOLUTE_PATH,
    }),
    BullModule.registerQueue({
      name: 'project',
    })
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectFileUploadConsumer],
})
export class ProjectModule { }
