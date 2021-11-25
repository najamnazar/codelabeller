import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../../modules/user/user.service';
import { AuthStrategy } from './auth-strategy.interface';
import { JwtAuthStrategy } from './auth-strategies/jwt/jwt-auth.strategy';
import { NullAuthStrategy } from './auth-strategies/null/null-auth.strategy';
import { GoogleOAuthJwtVerificationStrategy } from './auth-strategies/jwt/jwt-verification-strategies/google-oauth-jwt-verification.strategy';
import { DemoOAuthJwtVerificationStrategy } from '../../modules/demo-auth/demo-oauth-jwt-verification.strategy';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private authStrategy: AuthStrategy;

  private nullAuthStrategy !: NullAuthStrategy;
  private jwtAuthStrategy !: JwtAuthStrategy;

  constructor(private userService: UserService) {
    this.nullAuthStrategy = new NullAuthStrategy();
    this.jwtAuthStrategy = new JwtAuthStrategy(
      this.userService,
      [
        new GoogleOAuthJwtVerificationStrategy(),
        new DemoOAuthJwtVerificationStrategy()
      ]
    );
  }

  async use(request: Request, response: Response, next: NextFunction) {
    if (
      request.originalUrl.includes(`${process.env.API_GLOBAL_PREFIX}/config`)
      || request.originalUrl.includes(`${process.env.API_GLOBAL_PREFIX}/demo-auth`)
    ) {
      this.setAuthStrategy(this.nullAuthStrategy);
    }

    else {
      this.setAuthStrategy(this.jwtAuthStrategy);
    }

    await this.authStrategy.authenticate(request, response, next);
  }

  private setAuthStrategy(authStrategy: AuthStrategy) {
    this.authStrategy = authStrategy;
  }
}
