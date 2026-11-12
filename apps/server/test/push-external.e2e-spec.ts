import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';
import { encryptPayload } from '../src/utils/crypto';

describe('External Push SDK API /push/send (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let publicAppId: string;
  let secretKey: string;

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    token = loginRes.body.data.token;

    const appRes = await request(app.getHttpServer())
      .post('/api/apps')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'External SDK Sender App',
        description: 'App for testing /push/send encrypted dispatch',
      });

    publicAppId = appRes.body.data.public_app_id;
    secretKey = appRes.body.data.secret_key;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('POST /api/push/send - should fail with bad payload encryption', async () => {
    const res = await request(app.getHttpServer()).post('/api/push/send').send({
      appId: publicAppId,
      payload: 'invalid-unencrypted-junk',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/push/send - should decrypt payload symmetrically and enqueue notification', async () => {
    const unencryptedData = {
      notification: {
        title: 'Server-To-Server Push',
        body: 'Encrypted via Secret Key',
      },
      targets: {
        externalUserIds: ['user-101', 'user-102'],
      },
    };

    const encryptedPayload = encryptPayload(unencryptedData, secretKey);

    const res = await request(app.getHttpServer()).post('/api/push/send').send({
      appId: publicAppId,
      payload: encryptedPayload,
    });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notificationId).toBeDefined();
  });
});
