import { NextFunction, Request, Response } from 'express';

export interface AuthStrategy {
  authenticate(request: Request, response: Response, next: NextFunction): Promise<void>;
}
