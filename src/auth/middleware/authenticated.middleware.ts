import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticatedMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies['jwt'];
      if (token) {
        this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        return res.redirect('/');
      }
    } catch (e) {
      console.log('Token verification failed:', e);
    }
    next();
  }
}
