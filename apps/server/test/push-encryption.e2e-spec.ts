import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';
import { config } from '../src/config/env';
import { DataSource } from 'typeorm';
import { Notification } from '../src/modules/push/notification.entity';
import { isPayloadEncrypted, decryptPayload, SYSTEM_ENCRYPTION_KEY } from '../src/utils/crypto';

describe('Push & Payload Confidentiality Encryption APIs (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let publicAppId: string;
  let notificationId: number;
  const testPayload = {
    title: 'Top Secret Alert',
    body: 'Confidential Payload 12345 - Must be encrypted in database at rest',
    icon: '/icon.png',
    data: { customField: 'secret-token-xyz' },
  };

  beforeAll(async () => {
    app = await getTestApp();

    const loginRes = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: config.superAdmin.email,
      password: config.superAdmin.password,
    });
    token = loginRes.body.data.token;

    // Create an app for testing push
    const appRes = await request(app.getHttpServer())
      .post('/api/apps')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Encryption Test App',
        description: 'Verifies database confidentiality and preview endpoint',
      });
    publicAppId = appRes.body.data.public_app_id;
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('POST /api/apps/:id/push - should send notification and store encrypted payload in DB', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/apps/${publicAppId}/push`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        notification: testPayload,
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notificationId).toBeDefined();

    notificationId = res.body.data.notificationId;

    // VERIFY DIRECT DATABASE CONFIDENTIALITY:
    // Inspect the PostgreSQL record directly in the test database
    const dataSource = app.get(DataSource);
    const notificationRepo = dataSource.getRepository(Notification);
    const dbRecord = await notificationRepo.findOne({ where: { id: notificationId } });

    expect(dbRecord).toBeDefined();
    // 1. Must be stored in ciphertext format, not plain JSON
    expect(isPayloadEncrypted(dbRecord!.payload_json)).toBe(true);
    expect(dbRecord!.payload_json.startsWith('U2FsdGVkX1')).toBe(true);
    // 2. Raw JSON string must NOT be present in plaintext
    expect(dbRecord!.payload_json.includes('Top Secret Alert')).toBe(false);

    // 3. Decrypting with SYSTEM_ENCRYPTION_KEY must restore the original payload
    const decryptedFromDb = decryptPayload(dbRecord!.payload_json, SYSTEM_ENCRYPTION_KEY);
    expect(decryptedFromDb.title).toBe(testPayload.title);
    expect(decryptedFromDb.body).toBe(testPayload.body);
    expect(decryptedFromDb.data.customField).toBe(testPayload.data.customField);
  });

  it('GET /api/apps/:id/notifications - should return notifications with encrypted payload_json', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apps/${publicAppId}/notifications`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const found = res.body.data.find((n: any) => n.id === notificationId);
    expect(found).toBeDefined();
    // The payload_json in the list is the raw database encrypted ciphertext
    expect(isPayloadEncrypted(found.payload_json)).toBe(true);
  });

  it('GET /api/apps/:id/notifications/:notificationId/preview-payload - should decrypt and preview payload securely', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apps/${publicAppId}/notifications/${notificationId}/preview-payload`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(notificationId);
    expect(res.body.data.is_encrypted).toBe(true);
    expect(res.body.data.encrypted_payload.startsWith('U2FsdGVkX1')).toBe(true);

    // The gateway decrypts and returns the full structured payload
    expect(res.body.data.payload.title).toBe(testPayload.title);
    expect(res.body.data.payload.body).toBe(testPayload.body);
    expect(res.body.data.payload.data.customField).toBe(testPayload.data.customField);
  });

  it('GET /api/apps/:id/notifications/:notificationId/logs - should get delivery logs', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/apps/${publicAppId}/notifications/${notificationId}/logs`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /api/apps/:id/notifications/:notificationId - should delete notification', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/apps/${publicAppId}/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
