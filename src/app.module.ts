import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskController } from './task/task.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticatedMiddleware } from './auth/middleware/authenticated.middleware';
import { JwtExtractMiddleware } from './auth/middleware/jwt-extract.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthStatusInterceptor } from './common/interceptors/auth-status.interceptor';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AppController, TaskController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthStatusInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticatedMiddleware)
      .forRoutes(
        { path: 'auth/login', method: RequestMethod.GET },
        { path: 'auth/signup', method: RequestMethod.GET },
      );
    consumer
      .apply(JwtExtractMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
