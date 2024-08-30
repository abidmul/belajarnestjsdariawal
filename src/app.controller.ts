import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard'; // tambahkan import class

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard) // tambahkan kode untuk memproteksi route
  @Get()
  @Render('home')
  async getHello(): Promise<{ pageTitle: string }> {
    return {
      pageTitle: 'Home',
    };
  }
}
