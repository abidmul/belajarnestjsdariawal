import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Request } from 'express';
import { GetUser } from './common/decorators/user.decorator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Render('home')
  async root(@Req() req: Request, @GetUser('id') userId: number) {
    const user = req['user'] || { name: 'Guest', email: '' };

    const completedTaskCount = await prisma.task.count({
      where: { status: 'COMPLETED', userId },
    });

    const uncompletedTaskCount = await prisma.task.count({
      where: { status: { not: 'COMPLETED' }, userId },
    });

    return {
      pageTitle: 'Home',
      user,
      completedTaskCount,
      uncompletedTaskCount,
    };
  }
}
