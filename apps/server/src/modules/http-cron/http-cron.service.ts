import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CronJob } from './entities/cron-job.entity';
import { CronJobLog } from './entities/cron-job-log.entity';
import { HttpCronQueueScheduler } from './http-cron-queue.scheduler';
import {
  CreateCronJobDto,
  UpdateCronJobDto,
  CronJobResponse,
  CronJobLogResponse,
} from './http-cron.types';

@Injectable()
export class HttpCronService {
  private readonly logger = new Logger(HttpCronService.name);

  constructor(
    @InjectRepository(CronJob)
    private readonly cronJobRepo: Repository<CronJob>,
    @InjectRepository(CronJobLog)
    private readonly cronJobLogRepo: Repository<CronJobLog>,
    private readonly scheduler: HttpCronQueueScheduler
  ) {}

  private validateUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new BadRequestException('Target URL is required');
    }
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      throw new BadRequestException('Target URL must begin with http:// or https://');
    }
    return trimmed;
  }

  private validateSchedule(schedule: string): string {
    if (!schedule || typeof schedule !== 'string') {
      throw new BadRequestException('Schedule expression is required');
    }
    const parts = schedule.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      throw new BadRequestException(
        'Schedule must be a valid standard cron expression (e.g. "*/5 * * * *")'
      );
    }
    return schedule.trim();
  }

  async findAll(userId: number): Promise<CronJobResponse[]> {
    return this.cronJobRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<CronJobResponse> {
    const job = await this.cronJobRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!job) {
      throw new NotFoundException(`Cron job #${id} not found`);
    }
    return job;
  }

  async create(userId: number, dto: CreateCronJobDto): Promise<CronJobResponse> {
    const url = this.validateUrl(dto.url);
    const schedule = this.validateSchedule(dto.schedule);

    if (!dto.title || !dto.title.trim()) {
      throw new BadRequestException('Title is required');
    }

    const job = this.cronJobRepo.create({
      user_id: userId,
      title: dto.title.trim(),
      url,
      method: dto.method || 'GET',
      schedule,
      timezone: dto.timezone || 'UTC',
      headers: dto.headers || null,
      body: dto.body || null,
      timeout_seconds: dto.timeout_seconds ? Math.max(5, Math.min(120, dto.timeout_seconds)) : 30,
      retries: dto.retries !== undefined ? Math.max(0, Math.min(3, dto.retries)) : 0,
      is_enabled: dto.is_enabled !== undefined ? dto.is_enabled : true,
      notify_on_failure: dto.notify_on_failure !== undefined ? dto.notify_on_failure : true,
    });

    const saved = await this.cronJobRepo.save(job);

    if (saved.is_enabled) {
      await this.scheduler.registerScheduler(saved);
    }

    return saved;
  }

  async update(id: number, userId: number, dto: UpdateCronJobDto): Promise<CronJobResponse> {
    const job = await this.cronJobRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!job) {
      throw new NotFoundException(`Cron job #${id} not found`);
    }

    if (dto.url !== undefined) {
      job.url = this.validateUrl(dto.url);
    }
    if (dto.title !== undefined) {
      if (!dto.title.trim()) throw new BadRequestException('Title cannot be empty');
      job.title = dto.title.trim();
    }
    if (dto.method !== undefined) {
      job.method = dto.method;
    }
    if (dto.schedule !== undefined) {
      job.schedule = this.validateSchedule(dto.schedule);
    }
    if (dto.timezone !== undefined) {
      job.timezone = dto.timezone || 'UTC';
    }
    if (dto.headers !== undefined) {
      job.headers = dto.headers;
    }
    if (dto.body !== undefined) {
      job.body = dto.body;
    }
    if (dto.timeout_seconds !== undefined) {
      job.timeout_seconds = Math.max(5, Math.min(120, dto.timeout_seconds));
    }
    if (dto.retries !== undefined) {
      job.retries = Math.max(0, Math.min(3, dto.retries));
    }
    if (dto.notify_on_failure !== undefined) {
      job.notify_on_failure = dto.notify_on_failure;
    }

    const wasEnabled = job.is_enabled;
    if (dto.is_enabled !== undefined) {
      job.is_enabled = dto.is_enabled;
    }

    const saved = await this.cronJobRepo.save(job);

    // Synchronize scheduler
    if (saved.is_enabled) {
      await this.scheduler.registerScheduler(saved);
    } else if (wasEnabled && !saved.is_enabled) {
      await this.scheduler.removeScheduler(saved.id);
    }

    return saved;
  }

  async toggleEnabled(id: number, userId: number): Promise<CronJobResponse> {
    const job = await this.cronJobRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!job) {
      throw new NotFoundException(`Cron job #${id} not found`);
    }

    job.is_enabled = !job.is_enabled;
    const saved = await this.cronJobRepo.save(job);

    if (saved.is_enabled) {
      await this.scheduler.registerScheduler(saved);
    } else {
      await this.scheduler.removeScheduler(saved.id);
    }

    return saved;
  }

  async delete(id: number, userId: number): Promise<{ success: boolean }> {
    const job = await this.cronJobRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!job) {
      throw new NotFoundException(`Cron job #${id} not found`);
    }

    await this.scheduler.removeScheduler(job.id);
    await this.cronJobRepo.remove(job);

    return { success: true };
  }

  async runNow(id: number, userId: number): Promise<{ success: boolean; message: string }> {
    const job = await this.cronJobRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!job) {
      throw new NotFoundException(`Cron job #${id} not found`);
    }

    await this.scheduler.triggerNow(job.id);
    return { success: true, message: 'Execution scheduled immediately' };
  }

  async getLogs(id: number, userId: number, limit = 50): Promise<CronJobLogResponse[]> {
    const job = await this.cronJobRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!job) {
      throw new NotFoundException(`Cron job #${id} not found`);
    }

    const safeLimit = Math.max(1, Math.min(100, limit));
    return this.cronJobLogRepo.find({
      where: { cron_job_id: id },
      order: { triggered_at: 'DESC' },
      take: safeLimit,
    });
  }
}
