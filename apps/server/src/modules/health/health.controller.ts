import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import * as os from 'os';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { PUSH_QUEUE_NAME, CRON_QUEUE_NAME } from '../queue/queue.constants';

@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startedAt = new Date();

  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    @InjectQueue(PUSH_QUEUE_NAME) private readonly pushQueue: Queue,
    @InjectQueue(CRON_QUEUE_NAME) private readonly cronQueue: Queue
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check backend health status' })
  async check() {
    const checks: Record<string, any> = {};

    // --- Database check ---
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = { status: 'ok' };
    } catch (err: any) {
      checks.database = { status: 'error', message: err.message };
    }

    // --- Redis check ---
    try {
      const redisPing = await this.redisService.ping();
      checks.redis = {
        status: redisPing.ok ? 'ok' : 'error',
        latencyMs: redisPing.latencyMs,
        ...(redisPing.error ? { message: redisPing.error } : {}),
      };
    } catch (err: any) {
      checks.redis = { status: 'error', message: err.message };
    }

    // --- BullMQ Queues check ---
    try {
      const [pushCounts, cronSchedulers] = await Promise.all([
        this.pushQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
        this.cronQueue.getJobSchedulers(),
      ]);

      checks.queues = {
        status: 'ok',
        pushNotification: pushCounts,
        activeCronSchedules: cronSchedulers.map((r) => ({
          name: r.name,
          pattern: r.pattern,
          next: r.next ? new Date(r.next).toISOString() : null,
        })),
      };
    } catch (err: any) {
      checks.queues = { status: 'error', message: err.message };
    }

    // --- System info ---
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
    checks.server = {
      status: 'ok',
      uptime: uptimeSeconds,
      uptimeHuman: formatUptime(uptimeSeconds),
      startedAt: this.startedAt.toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        usedMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        totalMB: Math.round(os.totalmem() / 1024 / 1024),
      },
    };

    // --- Scheduler engine check ---
    checks.scheduler = {
      status: checks.queues?.status === 'ok' ? 'ok' : 'degraded',
      engine: 'BullMQ',
      repeatableCount: checks.queues?.activeCronSchedules?.length ?? 0,
    };

    const allOk = Object.values(checks).every((c) => c.status === 'ok');

    return {
      success: true,
      data: {
        status: allOk ? 'ok' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ');
}
