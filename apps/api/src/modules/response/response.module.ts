import { forwardRef, Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { UserModule } from '../user/user.module';
import { ResponseController } from './response.controller';
import { ResponseService } from './response.service';

@Module({
  controllers: [ResponseController],
  providers: [ResponseService],
  imports: [UserModule, forwardRef(() => FileModule)],
  exports: [ResponseService]
})
export class ResponseModule {}
