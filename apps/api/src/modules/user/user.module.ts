import { forwardRef, Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [forwardRef(() => FileModule)],
  exports: [UserService]
})
export class UserModule { }
