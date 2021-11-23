import { Module } from '@nestjs/common';
import { DesignPatternController } from './design-pattern.controller';
import { DesignPatternService } from './design-pattern.service';

@Module({
  controllers: [DesignPatternController],
  providers: [DesignPatternService]
})
export class DesignPatternModule {}
