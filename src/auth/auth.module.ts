import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy'; // tambahkan kode berikut
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard'; // tambahkan kode berikut

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    PassportModule,
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard], // tambahkan kode berikut
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
