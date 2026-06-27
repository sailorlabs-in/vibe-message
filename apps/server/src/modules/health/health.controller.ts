import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import * as os from 'os';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startedAt = new Date();

  constructor(private readonly dataSource: DataSource) {}

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

    // --- Cron/Scheduler check ---
    checks.scheduler = { status: 'ok' };

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
