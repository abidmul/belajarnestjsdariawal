import { PrismaClient } from '@prisma/client';
import { permissionSeeder } from './permissionSeeder';
import { roleSeeder } from './roleSeeder';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async () => {
    await permissionSeeder(prisma);
    await roleSeeder(prisma);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });