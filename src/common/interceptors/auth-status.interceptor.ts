import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDto } from 'src/user/dto/user.dto';

const prisma = new PrismaClient();

function getPermissions(user: UserDto): string[] {
  return (
    user.role?.rolePermissions?.map((rolePermission) => {
      return rolePermission.permission.name;
    }) || []
  );
}

@Injectable()
export class AuthStatusInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const isAuthenticated = !!request.user;

    let permissions = [];
    if (isAuthenticated) {
      const userId = request.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      });

      permissions = getPermissions(user);
    }
    request.userPermissions = permissions;

    return next.handle().pipe(
      map((data) => ({
        ...data,
        userPermissions: permissions,
        isAuthenticated,
      })),
    );
  }
}
