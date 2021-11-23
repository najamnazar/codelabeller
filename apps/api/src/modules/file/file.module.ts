import { forwardRef, Module } from '@nestjs/common';
import { ResponseModule } from '../response/response.module';
import { UserModule } from '../user/user.module';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [forwardRef(() => UserModule), forwardRef(() => ResponseModule)],
  exports: [FileService]
})
export class FileModule { }
