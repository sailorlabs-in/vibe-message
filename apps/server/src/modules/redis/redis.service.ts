import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { config } from '../../config/env';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;
  public readonly queueClient: Redis;
  private readonly redisOptions: RedisOptions;

  constructor() {
    this.redisOptions = this.buildRedisOptions();

    if (config.redis.url) {
      this.logger.log(`Connecting to Redis via REDIS_URL`);
      this.client = new Redis(config.redis.url, this.redisOptions);
      this.queueClient = new Redis(config.redis.url, this.redisOptions);
    } else {
      this.logger.log(
        `Connecting to Redis at ${this.redisOptions.host}:${this.redisOptions.port} (db: ${this.redisOptions.db ?? 0})`
      );
      this.client = new Redis(this.redisOptions);
      this.queueClient = new Redis(this.redisOptions);
    }

    this.client.on('connect', () => {
      this.logger.log('✅ Redis main client connected');
    });

    this.queueClient.on('connect', () => {
      this.logger.log('✅ Redis queue client connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ Redis main client error:', err.message);
    });

    this.queueClient.on('error', (err) => {
      this.logger.error('❌ Redis queue client error:', err.message);
    });
  }

  private buildRedisOptions(): RedisOptions {
    const opts: RedisOptions = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      username: config.redis.username,
      db: config.redis.db ?? 0,
      maxRetriesPerRequest: null, // Required for BullMQ and blocking queue queries
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    };

    if (config.redis.tls) {
      opts.tls = {};
    }

    if (config.redis.keyPrefix) {
      opts.keyPrefix = config.redis.keyPrefix;
    }

    return opts;
  }

  /**
   * Returns BullMQ connection options matching the application Redis setup.
   */
  public getBullMqConnectionOptions(): RedisOptions {
    return {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      username: config.redis.username,
      db: config.redis.db ?? 0,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      ...(config.redis.tls ? { tls: {} } : {}),
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
    };
  }

  /**
   * Ping Redis to verify connection health and measure latency.
   */
  async ping(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const response = await this.client.ping();
      const latencyMs = Date.now() - start;
      return {
        ok: response === 'PONG',
        latencyMs,
      };
    } catch (err: any) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  /**
   * Helper to inspect length of the legacy queue (for graceful migration)
   */
  async getLegacyQueueLength(): Promise<number> {
    try {
      return await this.client.llen('vibe:push_queue');
    } catch {
      return 0;
    }
  }

  /**
   * Helper to pop an item from the legacy queue (for graceful migration)
   */
  async popLegacyQueueItem(): Promise<string | null> {
    try {
      return await this.client.lpop('vibe:push_queue');
    } catch {
      return null;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting Redis clients...');
    await Promise.allSettled([this.client.quit(), this.queueClient.quit()]);
  }
}
