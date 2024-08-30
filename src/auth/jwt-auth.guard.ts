import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    try {
      const jwt = req.cookies['jwt'];
      if (!jwt) {
        response.redirect('/auth/login');
        return false;
      }
      this.jwtService.verify(jwt, { secret: process.env.JWT_SECRET });
      return true;
    } catch (error) {
      response.redirect('/auth/login');
      return false;
    }
  }
}
