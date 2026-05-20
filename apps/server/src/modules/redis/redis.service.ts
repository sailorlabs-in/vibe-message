import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { config } from "../../config/env";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;
  public readonly queueClient: Redis;

  constructor() {
    const redisOptions = {
      host: config.redis.host,
      port: config.redis.port,
      maxRetriesPerRequest: null, // Allow blocking queue queries to retry/wait
    };

    this.logger.log(`Connecting to Redis at ${redisOptions.host}:${redisOptions.port}`);
    this.client = new Redis(redisOptions);
    this.queueClient = new Redis(redisOptions);

    this.client.on("connect", () => {
      this.logger.log("✅ Redis main client connected");
    });

    this.queueClient.on("connect", () => {
      this.logger.log("✅ Redis queue client connected");
    });

    this.client.on("error", (err) => {
      this.logger.error("❌ Redis main client error:", err);
    });

    this.queueClient.on("error", (err) => {
      this.logger.error("❌ Redis queue client error:", err);
    });
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting Redis clients...");
    await this.client.quit();
    await this.queueClient.quit();
  }
}
