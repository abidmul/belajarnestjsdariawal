import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

export async function createTestApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  app.useStaticAssets(resolve('./public'));
  app.setBaseViewsDir(resolve('./views'));
  app.setViewEngine('ejs');

  app.use(cookieParser());

  await app.init();

  const prisma = new PrismaClient();
  await prisma.$connect();

  return { app, prisma };
}

export async function cleanupTestApp(
  app: NestExpressApplication,
  prisma: PrismaClient,
) {
  await prisma.$disconnect();
  await app.close();
}
