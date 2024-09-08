import { NestExpressApplication } from '@nestjs/platform-express';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { cleanupTestApp, createTestApp } from './test-utils'; //import dari file test-utils

describe('AuthController (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
    await prisma.task.deleteMany({});

    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await cleanupTestApp(app, prisma);
  });

  it('User can access the signup page', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/signup')
      .expect(200);

    expect(response.text).toContain('Signup');
  });

  it('User can sign up with valid credentials and is redirected to "/"', async () => {
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password',
      })
      .expect(302);

    expect(signupResponse.headers.location).toBe('/');

    const cookies = signupResponse.headers['set-cookie'];
    const jwtCookie = Array.isArray(cookies)
      ? cookies.find((cookie) => cookie.startsWith('jwt='))
      : cookies;

    const homePageResponse = await request(app.getHttpServer())
      .get('/')
      .set('Cookie', jwtCookie)
      .expect(200);

    expect(homePageResponse.text).toContain('Hi, New User!');

    const newUser = await prisma.user.findUnique({
      where: { email: 'newuser@example.com' },
    });
    expect(newUser).not.toBeNull();
    expect(newUser.name).toBe('New User');
  });

  it('User can access the login page', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/login')
      .expect(200);

    expect(response.text).toContain('Login');
  });

  it('User can log in with valid credentials and is redirected to "/"', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(302);

    expect(loginResponse.headers.location).toBe('/');

    const cookies = loginResponse.headers['set-cookie'];
    const jwtCookie = Array.isArray(cookies)
      ? cookies.find((cookie) => cookie.startsWith('jwt='))
      : cookies;

    const homePageResponse = await request(app.getHttpServer())
      .get('/')
      .set('Cookie', jwtCookie)
      .expect(200);

    expect(homePageResponse.text).toContain('Hi, Test User!');
  });
});
