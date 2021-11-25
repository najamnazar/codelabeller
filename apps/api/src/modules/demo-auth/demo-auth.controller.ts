import { BadRequestException, Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { DemoAuthService } from './demo-auth.service';
import { Request } from 'express';
import { DemoAccount, DemoAccountCheck, DemoAccountToken } from '@codelabeller/api-interfaces';
import { Job } from 'node-schedule';

@Controller('demo-auth')
export class DemoAuthController {
  ipCountTableResetJob: Job;

  constructor(private demoAuthService: DemoAuthService) {}

  @Post("/account-exists")
  async checkDemoAccountExists(@Body() account: { [key: string]: string }): Promise<DemoAccountCheck> {
    const email = account.email;

    if (!email) {
      throw new BadRequestException('Invalid demo account credentials were specified.');
    }

    const result = await this.demoAuthService.doesDemoAccountExist(email);

    return {
      exists: result
    };
  }

  @Post("/login")
  async loginDemoAccount(@Body() account: { [key: string]: string }): Promise<DemoAccountToken> {
    const email = account.email;

    if (!email) {
      throw new BadRequestException('Invalid demo account credentials were specified.');
    }

    if (!(await this.demoAuthService.doesDemoAccountExist(email))) {
      throw new UnauthorizedException('You cannot login as that demo account, as it does not exist. This might be due to the hourly demo app reset.')
    }

    return {
      token: await this.demoAuthService.getTokenForAccount(email)
    };
  }

  @Post("/account")
  async createDemoAccount(@Req() request: Request): Promise<DemoAccount> {
    const createdAccount = await this.demoAuthService.createDemoAccount();

    return {
      givenName: createdAccount.givenName,
      familyName: createdAccount.familyName,
      email: createdAccount.email
    };
  }
}
