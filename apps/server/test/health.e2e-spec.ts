import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { getTestApp, closeTestApp } from './test-app';

describe('Health APIs (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it('GET /api/health - should return status ok with database, redis, and queue diagnostic checks', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.checks.database.status).toBe('ok');
    expect(res.body.data.checks.redis.status).toBe('ok');
    expect(res.body.data.checks.queues.status).toBe('ok');
    expect(res.body.data.timestamp).toBeDefined();
  });
});
