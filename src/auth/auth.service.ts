import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { id: user.id, name: user.name, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      return await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
