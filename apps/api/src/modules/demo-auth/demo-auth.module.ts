import { Module } from '@nestjs/common';
import { DemoAuthController } from './demo-auth.controller';
import { DemoAuthService } from './demo-auth.service';

@Module({
  controllers: [DemoAuthController],
  providers: [DemoAuthService]
})
export class DemoAuthModule {}
