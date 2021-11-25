import { UnauthorizedException } from "@nestjs/common";
import { decode, Jwt, JwtPayload, TokenExpiredError, verify } from 'jsonwebtoken';
import { JwtIssuerVerificationStrategy } from "../../middleware/auth/auth-strategies/jwt/jwt-verification-strategies/jwt-issuer-verification-strategy.interface";

export class DemoOAuthJwtVerificationStrategy implements JwtIssuerVerificationStrategy {
  public getIssuerName(): string {
    return `https://${process.env.API_DOMAIN_NAME}`;
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
    try {
      return verify(encodedJwt, process.env.DEMO_JWT_SIGNING_KEY, { maxAge: "1h" });

    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(`The authorization token provided has expired at: ${error.expiredAt.toUTCString()}`);
      }

      throw new UnauthorizedException("The authorization token provided is invalid." + error);
    }
  }
}