import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';
import { decryptPayload, SYSTEM_ENCRYPTION_KEY } from '../src/utils/crypto';

describe('System APIs (E2E)', () => {
  let app: INestApplication;
  let superAdminToken: string;

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    superAdminToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('GET /api/system/public-settings - should return encrypted payload that decrypts correctly', async () => {
    const res = await request(app.getHttpServer()).get('/api/system/public-settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data).toBe('string');
    expect(res.body.data.startsWith('U2FsdGVkX1')).toBe(true);

    const decrypted = decryptPayload(res.body.data, SYSTEM_ENCRYPTION_KEY);
    expect(decrypted).toBeDefined();
    expect(typeof decrypted.hide_forgot_password).toBe('boolean');
  });

  it('GET /api/system/settings - should return full system settings for Super Admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/system/settings')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.default_retention_days).toBeDefined();
  });

  it('PUT /api/system/settings - should update global system settings', async () => {
    const res = await request(app.getHttpServer())
      .put('/api/system/settings')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        default_retention_days: 30,
        hide_forgot_password: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.default_retention_days).toBe(30);
  });
});

