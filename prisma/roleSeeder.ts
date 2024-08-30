import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function roleSeeder(prisma: PrismaClient) {
  const permissions = await prisma.permission.findMany();

  const role = await prisma.role.create({
    data: {
      name: 'Admin',
      rolePermissions: {
        create: permissions.map((permission) => ({
          permission: {
            connect: { id: permission.id },
          },
        })),
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@mail.com',
      password: await bcrypt.hash('123456', 10),
      roleId: role.id,
    },
  });
}