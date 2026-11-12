import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';

describe('User & Enterprise License APIs (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let userId: number;
  let enterpriseKey: string;

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    token = loginRes.body.data.token;
    userId = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('GET /api/user/verify-license - should return invalid for missing licenseKey', async () => {
    const res = await request(app.getHttpServer()).get('/api/user/verify-license');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(false);
  });

  it('GET /api/user/verify-license - should return invalid for non-existent license key', async () => {
    const res = await request(app.getHttpServer()).get(
      '/api/user/verify-license?licenseKey=non_existent_key_123'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(false);
  });

  it('POST /api/user/enterprise-key/request - should request an enterprise license key', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/enterprise-key/request')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enterprise_key_requested).toBe(true);
  });

  it('Admin generates enterprise key and user verifies it', async () => {
    // Generate key for user via admin endpoint
    const genRes = await request(app.getHttpServer())
      .post(`/api/admin/users/${userId}/enterprise-key`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(genRes.status);
    expect(genRes.body.success).toBe(true);
    expect(genRes.body.data.enterprise_key).toBeDefined();

    enterpriseKey = genRes.body.data.enterprise_key;

    // Verify license
    const verifyRes = await request(app.getHttpServer()).get(
      `/api/user/verify-license?licenseKey=${enterpriseKey}`
    );
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.valid).toBe(true);
    expect(verifyRes.body.data.ownerEmail).toBe(config.superAdmin.email);
  });

  it('POST /api/user/enterprise-key/shuffle - should regenerate enterprise key', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/user/enterprise-key/shuffle')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enterprise_key).toBeDefined();
    expect(res.body.data.enterprise_key).not.toBe(enterpriseKey);
  });
});
