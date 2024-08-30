import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser'; // mengimport cookie-parser

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(resolve('./public'));
  app.setBaseViewsDir(resolve('./views'));
  app.setViewEngine('ejs');

  app.use(cookieParser()); // mengimport cookie-parser

  app.use(methodOverride('_method'));

  await app.listen(3000);
}
bootstrap();
