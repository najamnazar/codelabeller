import { Jwt, JwtPayload } from "jsonwebtoken";

export interface JwtIssuerVerificationStrategy {
  getIssuerName(): string;
  decodeJwt(jwt: string): Jwt;
  verifyJwt(encodedJwt: string): Promise<JwtPayload | string>;
}