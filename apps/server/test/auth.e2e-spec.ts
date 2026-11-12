import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';

describe('Auth APIs (E2E)', () => {
  let app: INestApplication;
  let superAdminToken: string;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('POST /api/auth/login - should fail with wrong credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login - should successfully log in Super Admin', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('SUPER_ADMIN');

    superAdminToken = res.body.data.token;
  });

  it('GET /api/auth/me - should fail without auth token', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me - should return profile for authenticated user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(config.superAdmin.email);
  });

  it('POST /api/auth/signup - should create a new user with PENDING status', async () => {
    const randomSuffix = Math.floor(Math.random() * 100000);
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: `Test User ${randomSuffix}`,
        email: `tester_${randomSuffix}@example.com`,
        password: 'Password@123',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.status).toBe('PENDING');
  });

  it('PATCH /api/auth/profile - should update profile name', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Super Administrator Updated',
        email: config.superAdmin.email,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Super Administrator Updated');
  });

  it('POST /api/auth/forgot-password - should handle reset password request', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: config.superAdmin.email });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });
});
