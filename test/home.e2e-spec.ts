import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { cleanupTestApp, createTestApp } from './test-utils';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());

    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('password', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test2@example.com',
        password: hashedPassword,
      },
    });
    const dueDate = new Date(new Date().setDate(new Date().getDate() + 7));
    const now = new Date();

    await prisma.task.createMany({
      data: [
        {
          userId: user.id,
          name: 'task 1',
          dueDate,
          createdAt: now,
          updatedAt: now,
          status: 'COMPLETED',
        },
        {
          userId: user.id,
          name: 'task 2',
          dueDate,
          createdAt: now,
          updatedAt: now,
          status: 'COMPLETED',
        },
        {
          userId: user.id,
          name: 'task 3',
          dueDate,
          createdAt: now,
          updatedAt: now,
          status: 'COMPLETED',
        },
        {
          userId: user.id,
          name: 'task 4',
          dueDate,
          createdAt: now,
          updatedAt: now,
          status: 'NOT_STARTED',
        },
        {
          userId: user.id,
          name: 'task 5',
          dueDate,
          createdAt: now,
          updatedAt: now,
          status: 'NOT_STARTED',
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanupTestApp(app, prisma);
  });

  it('Should render the home page with correct task counts', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test2@example.com', password: 'password' })
      .expect(302);

    const cookies = loginResponse.headers['set-cookie'];
    const jwtCookie = Array.isArray(cookies)
      ? cookies.find((cookie) => cookie.startsWith('jwt='))
      : cookies;

    const homePageResponse = await request(app.getHttpServer())
      .get('/')
      .set('Cookie', jwtCookie)
      .expect(200);

    expect(homePageResponse.text).toContain('Home');
    expect(homePageResponse.text).toContain('You have completed 3 task');
    expect(homePageResponse.text).toContain('You still have 2 tasks left');
  });
});
