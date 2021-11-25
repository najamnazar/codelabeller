import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { getDbConnectionOptions, getBullMqConnectionOptions } from '../config';
import { AuthMiddleware } from '../middleware/auth/auth.middleware';
import { DesignPatternModule } from '../modules/design-pattern/design-pattern.module';
import { FileModule } from '../modules/file/file.module';
import { FileUploadJobModule } from '../modules/file-upload-job/file-upload-job.module';
import { OptionModule } from '../modules/option/option.module';
import { ProjectModule } from '../modules/project/project.module';
import { ResponseModule } from '../modules/response/response.module';
import { UserModule } from '../modules/user/user.module';
import { DemoAuthModule } from '../modules/demo-auth/demo-auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDbConnectionOptions()),
    BullModule.forRoot(getBullMqConnectionOptions()),
    DesignPatternModule,
    ProjectModule,
    FileModule,
    FileUploadJobModule,
    ResponseModule,
    UserModule,
    OptionModule,
    DemoAuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
