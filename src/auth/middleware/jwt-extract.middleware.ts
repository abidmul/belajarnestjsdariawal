import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtExtractMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies['jwt'];
      if (token) {
        const decoded = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });
        req['user'] = decoded;
      }
    } catch (error) {
      console.log('Error verifying JWT token:', error);
    }
    next();
  }
}
