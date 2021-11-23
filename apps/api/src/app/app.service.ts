import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getOAuthClientId() {
    return process.env.GOOGLE_OAUTH_CLIENT_ID;
  }
}
