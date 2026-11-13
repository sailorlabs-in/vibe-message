import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { config } from '../../config/env';

jest.mock('ioredis');

describe('RedisService (Unit Tests)', () => {
  let service: RedisService;
  let mockClientInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClientInstance = {
      on: jest.fn((event, cb) => {
        if (event === 'connect') cb();
        if (event === 'error') cb(new Error('Mock Redis error'));
        return mockClientInstance;
      }),
      ping: jest.fn().mockResolvedValue('PONG'),
      llen: jest.fn().mockResolvedValue(5),
      lpop: jest.fn().mockResolvedValue('{"job":1}'),
      quit: jest.fn().mockResolvedValue('OK'),
    };

    (Redis as unknown as jest.Mock).mockImplementation(() => mockClientInstance);
    service = new RedisService();
  });

  it('should instantiate and configure Redis clients with host or url', () => {
    expect(Redis).toHaveBeenCalled();
    expect(service.client).toBeDefined();
    expect(service.queueClient).toBeDefined();

    const origUrl = config.redis.url;
    config.redis.url = 'redis://localhost:6379';
    const serviceWithUrl = new RedisService();
    expect(serviceWithUrl).toBeDefined();
    config.redis.url = origUrl;
  });

  it('should return bullmq connection options', () => {
    const opts = service.getBullMqConnectionOptions();
    expect(opts.host).toBe(config.redis.host);
    expect(opts.port).toBe(config.redis.port);
    expect(opts.maxRetriesPerRequest).toBeNull();
    if (typeof opts.retryStrategy === 'function') {
      expect(opts.retryStrategy(2)).toBe(200);
      expect(opts.retryStrategy(50)).toBe(3000);
    }
  });

  it('should ping Redis successfully and measure latency', async () => {
    const res = await service.ping();
    expect(res.ok).toBe(true);
    expect(res.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle ping error gracefully', async () => {
    mockClientInstance.ping.mockRejectedValueOnce(new Error('Connection lost'));
    const res = await service.ping();
    expect(res.ok).toBe(false);
    expect(res.error).toBe('Connection lost');
  });

  it('should get legacy queue length and pop item with fallback to 0/null on error', async () => {
    expect(await service.getLegacyQueueLength()).toBe(5);
    expect(await service.popLegacyQueueItem()).toBe('{"job":1}');

    mockClientInstance.llen.mockRejectedValueOnce(new Error('llen fail'));
    expect(await service.getLegacyQueueLength()).toBe(0);

    mockClientInstance.lpop.mockRejectedValueOnce(new Error('lpop fail'));
    expect(await service.popLegacyQueueItem()).toBeNull();
  });

  it('should disconnect on onModuleDestroy', async () => {
    await service.onModuleDestroy();
    expect(mockClientInstance.quit).toHaveBeenCalled();
  });
});

