import { PrismaClient } from '@prisma/client';

export async function permissionSeeder(prisma: PrismaClient) {
  const time = new Date();

  const permissions = [
    {
      name: 'view-any-tasks',
      description: 'View any tasks',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'update-any-tasks',
      description: 'Update any tasks',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'delete-any-tasks',
      description: 'Delete any tasks',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'view-any-roles',
      description: 'View any roles',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'create-new-roles',
      description: 'Create new roles',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'update-any-roles',
      description: 'Update any roles',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'delete-any-roles',
      description: 'Delete any roles',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'view-users-and-roles',
      description: 'View other users and their roles',
      createdAt: time,
      updatedAt: time,
    },
    {
      name: 'manage-user-roles',
      description: 'Manage roles of users',
      createdAt: time,
      updatedAt: time,
    },
  ];

  await prisma.permission.createMany({
    data: permissions,
  });
}