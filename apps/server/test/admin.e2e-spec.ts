import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';

describe('Admin Management APIs (E2E)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let testUserId: number;

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    superAdminToken = loginRes.body.data.token;

    // Create a user to manage
    const random = Math.floor(Math.random() * 100000);
    const regRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        name: `Manageable User ${random}`,
        email: `managed_${random}@example.com`,
        password: 'Password@123',
      });
    testUserId = regRes.body.data.user.id;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('GET /api/admin/users - should return list of registered users for Super Admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((u: any) => u.id === testUserId)).toBe(true);
  });

  it('GET /api/admin/notifications - should return decrypted system alerts for admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/notifications')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PATCH /api/admin/users/:id/status - should approve pending user', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/users/${testUserId}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ status: 'APPROVED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('PATCH /api/admin/users/:id/app-limit - should update user app limit', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/users/${testUserId}/app-limit`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ appLimit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.app_limit).toBe(10);
  });

  it('PATCH /api/admin/users/:id/cron-job-limit - should update user cron job limit', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/users/${testUserId}/cron-job-limit`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ cronJobLimit: 15 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cron_job_limit).toBe(15);
  });

  it('POST /api/admin/users/:id/warn - should issue an administrative warning', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/admin/users/${testUserId}/warn`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ message: 'E2E Test warning from SuperAdmin' });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('E2E Test warning from SuperAdmin');
  });

  it('POST /api/admin/users/:id/enterprise-key - should generate enterprise license key', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/admin/users/${testUserId}/enterprise-key`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enterprise_key).toBeDefined();
  });

  it('DELETE /api/admin/users/:id/enterprise-key - should revoke enterprise license key', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/admin/users/${testUserId}/enterprise-key`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enterprise_key).toBeNull();
  });
});
