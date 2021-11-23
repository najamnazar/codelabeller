import { Controller, Get } from '@nestjs/common';
import { AppConfigResponse } from '@codelabeller/api-interfaces';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/config')
  async getConfig(): Promise<AppConfigResponse> {
    return {
      cid: this.appService.getOAuthClientId(),
      apiHost: process.env.API_DOMAIN_NAME,
      apiPrefix: process.env.API_GLOBAL_PREFIX
    }
  }
}
