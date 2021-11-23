import { UnauthorizedException } from "@nestjs/common";
import axios from 'axios';
import { decode, Jwt, JwtPayload, TokenExpiredError, verify } from 'jsonwebtoken';
import { JwtIssuerVerificationStrategy } from "./jwt-issuer-verification-strategy.interface";

export class GoogleOAuthJwtVerificationStrategy implements JwtIssuerVerificationStrategy {
  certificates = {};

  public getIssuerName(): string {
    return 'https://accounts.google.com';
  }

  public decodeJwt(encodedJwt: string): Jwt {
    // Verify the JWT token structure
    const decodedJwt = decode(encodedJwt, { complete: true });

    if (!decodedJwt) {
      throw new UnauthorizedException("The authorization token provided is invalid.");
    }

    return decodedJwt;
  }

  public async verifyJwt(encodedJwt: string): Promise<JwtPayload | string> {
    const decodedJwt = this.decodeJwt(encodedJwt);
    const keyId = decodedJwt['header'].kid;

    // Speed up validation of JWT by caching required valid certificates.
    if (!this.certificates[keyId]) {
      this.certificates = await this.getJwtCertificates();
    }

    try {
      return verify(encodedJwt, this.certificates[keyId], { maxAge: "1h" });

    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(`The authorization token provided has expired at: ${error.expiredAt.toUTCString()}`);
      }

      throw new UnauthorizedException("The authorization token provided is invalid.");
    }
  }

  private async getJwtCertificates() {
    const options = {
      uri: `https://www.googleapis.com/oauth2/v1/certs`,
      json: true
    };

    try {
      const result = await axios.get(options.uri);
      return result.data;

    } catch (error) {
      throw new UnauthorizedException(`Unable to verify the provided authorization token.`);
    }
  }
}