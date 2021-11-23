import { NextFunction, Request, Response } from 'express';
import { AuthStrategy } from '../../auth-strategy.interface';

export class NullAuthStrategy implements AuthStrategy {
  async authenticate(request: Request, response: Response, next: NextFunction) {
    next();
  }
}
