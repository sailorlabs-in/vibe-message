import { config } from './env';

describe('Config Environment (Unit Tests)', () => {
  it('should have required config fields populated', () => {
    expect(config.database.url).toBeDefined();
    expect(config.jwt.secret).toBeDefined();
    expect(config.superAdmin.email).toBeDefined();
    expect(config.server.port).toBeGreaterThan(0);
    expect(config.cors.allowedOrigins).toBeInstanceOf(Array);
    expect(config.redis.host).toBeDefined();
    expect(config.mail).toBeDefined();
  });
});

