import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';

describe('HTTP Cron Jobs APIs (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let cronJobId: number;

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

  it('POST /api/cron-jobs - should create a new HTTP cron job', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/cron-jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Daily Ping Job',
        url: 'https://httpbin.org/get',
        method: 'GET',
        schedule: '0 0 * * *',
        is_enabled: true,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();

    cronJobId = res.body.data.id;
  });

  it('GET /api/cron-jobs - should list cron jobs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/cron-jobs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((j: any) => j.id === cronJobId)).toBe(true);
  });

  it('GET /api/cron-jobs/:id - should get single cron job', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/cron-jobs/${cronJobId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Daily Ping Job');
  });

  it('PATCH /api/cron-jobs/:id - should update cron job', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/cron-jobs/${cronJobId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Ping Job',
        is_enabled: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Ping Job');
    expect(res.body.data.is_enabled).toBe(false);
  });

  it('PATCH /api/cron-jobs/:id/toggle - should toggle cron job state', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/cron-jobs/${cronJobId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_enabled).toBe(true);
  });

  it('GET /api/cron-jobs/:id/logs - should get execution logs', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/cron-jobs/${cronJobId}/logs`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /api/cron-jobs/:id - should delete cron job', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/cron-jobs/${cronJobId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
