import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';
import { encryptPayload } from '../src/utils/crypto';

describe('SDK & Device Subscriber APIs (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let publicAppId: string;
  let publicKey: string;
  const testUserId = `subscriber_${Date.now()}`;
  const mockSubscription = {
    endpoint: `https://fcm.googleapis.com/fcm/send/test-token-${Date.now()}`,
    keys: {
      auth: 'kEwE1234567890abcdef',
      p256dh: 'BNcR1234567890abcdefghijklmnop',
    },
  };

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    token = loginRes.body.data.token;

    // Create an app for SDK tests
    const appRes = await request(app.getHttpServer())
      .post('/api/apps')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SDK Testing App',
        description: 'App for device registration and token verification',
      });
    publicAppId = appRes.body.data.public_app_id;
    publicKey = appRes.body.data.public_key;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('GET /api/sdk/vapid-public-key - should return public VAPID key', async () => {
    const res = await request(app.getHttpServer()).get('/api/sdk/vapid-public-key');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.publicKey).toBeDefined();
  });

  it('POST /api/sdk/register-device - should register a new device token with encrypted payload', async () => {
    const payloadData = {
      publicKey: publicKey,
      externalUserId: testUserId,
      subscription: mockSubscription,
      timezone: 'UTC',
    };
    const encryptedPayload = encryptPayload(payloadData, publicKey);

    const res = await request(app.getHttpServer()).post('/api/sdk/register-device').send({
      appId: publicAppId,
      payload: encryptedPayload,
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deviceId).toBeDefined();
  });

  it('GET /api/apps/:id/subscribers - should list registered devices for app', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apps/${publicAppId}/subscribers`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((d: any) => d.external_user_id === testUserId)).toBe(true);
  });

  it('POST /api/sdk/track - should track push delivery / interaction', async () => {
    const res = await request(app.getHttpServer()).post('/api/sdk/track').send({
      logId: 1,
      status: 'DELIVERED',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/sdk/unregister-device - should unregister device token', async () => {
    const payloadData = {
      externalUserId: testUserId,
      endpoint: mockSubscription.endpoint,
    };
    const encryptedPayload = encryptPayload(payloadData, publicKey);

    const res = await request(app.getHttpServer()).post('/api/sdk/unregister-device').send({
      appId: publicAppId,
      payload: encryptedPayload,
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });
});
