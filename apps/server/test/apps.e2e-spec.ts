import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';

describe('App Management APIs (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let createdAppId: string;

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    token = loginRes.body.data.token;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('POST /api/apps - should create a new application', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/apps')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'E2E Test Mobile App',
        description: 'Test application for automated verification',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.public_app_id).toBeDefined();
    expect(res.body.data.public_key).toBeDefined();
    expect(res.body.data.secret_key).toBeDefined();

    createdAppId = res.body.data.public_app_id;
  });

  it('GET /api/apps - should list all apps owned by user', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/apps')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((a: any) => a.public_app_id === createdAppId)).toBe(true);
  });

  it('GET /api/apps/:id - should get single app details', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apps/${createdAppId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.public_app_id).toBe(createdAppId);
    expect(res.body.data.name).toBe('E2E Test Mobile App');
  });

  it('PATCH /api/apps/:id - should update app details', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/apps/${createdAppId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated E2E Mobile App',
        description: 'Updated description',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated E2E Mobile App');
  });

  it('POST /api/apps/:id/rotate-secret - should rotate credentials', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/apps/${createdAppId}/rotate-secret`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.secret_key).toBeDefined();
  });

  it('POST /api/apps/:id/members - should add a member to app', async () => {
    const randomSuffix = Math.floor(Math.random() * 100000);
    const memberEmail = `member_${randomSuffix}@example.com`;

    // Sign up a user first
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: `Member ${randomSuffix}`,
        email: memberEmail,
        password: 'Password@123',
      });

    const res = await request(app.getHttpServer())
      .post(`/api/apps/${createdAppId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: memberEmail,
        role: 'moderator',
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/apps/:id/members - should list members', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apps/${createdAppId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /api/apps/:id - should delete app', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/apps/${createdAppId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
