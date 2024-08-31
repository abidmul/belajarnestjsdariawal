import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Policy } from './policies.interface';
import { POLICIES_KEY } from '../common/decorators/policies.decorator';
import { PrismaClient } from '@prisma/client';
import { UserDto } from 'src/user/dto/user.dto';

const prisma = new PrismaClient();

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPolicies =
      this.reflector.get<Policy[]>(POLICIES_KEY, context.getHandler()) || [];

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });

    const hasAccess = requiredPolicies.every((policy) =>
      this.execPolicyHandler(policy, user, context),
    );

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  private execPolicyHandler(
    policy: Policy,
    user: UserDto,
    context: ExecutionContext,
  ): boolean {
    if (typeof policy === 'function') {
      return policy(user, context);
    }
    return policy.handle(user, context);
  }
}
