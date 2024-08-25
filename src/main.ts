import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as methodOverride from 'method-override'; // mendaftarkan method override

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(resolve('./public'));
  app.setBaseViewsDir(resolve('./views'));
  app.setViewEngine('ejs');

  app.use(methodOverride('_method')); // mendaftarkan method override

  await app.listen(3000);
}
bootstrap();
