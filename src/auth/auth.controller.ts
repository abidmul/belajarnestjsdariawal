import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('signup')
  @Render('auth/signup')
  getSignup() {
    return { pageTitle: 'Signup' };
  }
  @Post('signup')
  async signup(@Body() createUserDto: SignupDto, @Res() res: Response) {
    try {
      const user = await this.authService.signup(
        createUserDto.name,
        createUserDto.email,
        createUserDto.password,
      );
      const token = await this.authService.login(user);
      res.cookie('jwt', token.access_token, { httpOnly: true });
      res.redirect('/');
    } catch (error) {
      console.error('Signup error:', error);
      res.redirect('/auth/signup');
    }
  }

  @Get('login')
  @Render('auth/login')
  getLogin() {
    return { pageTitle: 'Login' };
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const token = await this.authService.login(user);
    res.cookie('jwt', token.access_token, { httpOnly: true });
    res.redirect('/task');
  }
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt', { httpOnly: true });
    return res.redirect('/auth/login');
  }
}
