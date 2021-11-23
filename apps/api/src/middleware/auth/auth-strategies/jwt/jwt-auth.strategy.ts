import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Jwt, decode } from 'jsonwebtoken';
import { AuthStrategy } from '../../auth-strategy.interface';
import { IUser } from '@codelabeller/api-interfaces';
import { UserAuthProvider } from '../../user-auth-provider.interface';
import { JwtIssuerVerificationStrategy } from './jwt-verification-strategies/jwt-issuer-verification-strategy.interface';

export class JwtAuthStrategy implements AuthStrategy {
  private strategiesMap: { [issuer: string]: JwtIssuerVerificationStrategy } = {};

  constructor(
    private userAuthProvider: UserAuthProvider,
    private jwtVerificationStrategies: JwtIssuerVerificationStrategy[]
  ) {
    for (const strategy of jwtVerificationStrategies) {
      this.strategiesMap[strategy.getIssuerName()] = strategy;
    }
  }

  async authenticate(request: Request, response: Response, next: NextFunction) {
    this.checkJwtPresent(request);

    const decodedJwt = this.decodeJwt(request);
    const issuer = decodedJwt.payload.iss;
    const strategy = this.strategiesMap[issuer];

    if (!strategy) {
      throw new UnauthorizedException("The authorization token provided is invalid.");
    }

    const claims = await strategy.verifyJwt(request.headers.authorization);

    request['userClaims'] = claims;

    let currentUser = await this.userAuthProvider.getUserFromEmail(claims['email']);
    const unlistedAllowed = await this.userAuthProvider.areUnlistedUsersAllowed();

    // Deny access if user is not currently registered and app access is set to block unregistered users,
    if ((!currentUser && !unlistedAllowed)) {
      throw new ForbiddenException("You are not allowed to access CodeLabeller. Please contact an admin if you believe you should have access.");
    }

    // or user is registered but access has been disabled.
    if (currentUser && !currentUser.isEnabled) {
      throw new ForbiddenException("Your CodeLabeller account has been disabled. Please contact an admin if you believe you should have access.");
    }

    // If user does not exist and public access allowed, a new account will be created.
    if (!currentUser && unlistedAllowed) {
      currentUser = await this.userAuthProvider.createUser({
        givenName: claims['given_name'],
        familyName: claims['family_name'],
        email: claims['email'],
        isEnabled: true,
        isAdmin: false,
        currentFile: null,
        responseCount: 0,
        responses: [],
        lastSeen: new Date()
      } as IUser);
    }

    request['currentUser'] = currentUser;

    // No need to wait for last seen status to be updated - do it asynchronously.
    this.userAuthProvider.updateLastSeen(claims['email']);
    next();
  }

  private checkJwtPresent(req: Request) {
    // Request must have JWT bearer token included in the request header.
    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
  }

  private decodeJwt(req: Request): Jwt {
    let encodedJwt: string = req.headers.authorization;

    // Remove "Bearer " prefix if it is included in the Authorization header
    if (encodedJwt.substr(0, 7) === "Bearer ") {
      encodedJwt = encodedJwt.substr(7);
      req.headers.authorization = encodedJwt;
    }

    // Verify the JWT token structure
    const decodedJwt = decode(encodedJwt, { complete: true });

    if (!decodedJwt) {
      throw new UnauthorizedException("The authorization token provided is invalid.");
    }

    return decodedJwt;
  }
}
