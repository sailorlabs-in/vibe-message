import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { CronJobLog } from './cron-job-log.entity';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

@Entity('cron_jobs')
export class CronJob {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  user_id!: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'varchar', length: 10, default: 'GET' })
  method!: HttpMethod;

  @Column({ type: 'varchar', length: 100, default: '*/5 * * * *' })
  schedule!: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone!: string;

  @Column({ type: 'jsonb', nullable: true })
  headers!: Record<string, string> | null;

  @Column({ type: 'text', nullable: true })
  body!: string | null;

  @Column({ name: 'timeout_seconds', type: 'int', default: 30 })
  timeout_seconds!: number;

  @Column({ type: 'int', default: 0 })
  retries!: number;

  @Column({ name: 'is_enabled', default: true })
  is_enabled!: boolean;

  @Column({ name: 'notify_on_failure', default: true })
  notify_on_failure!: boolean;

  @Column({ name: 'last_run_at', type: 'timestamp with time zone', nullable: true })
  last_run_at!: Date | null;

  @Column({ name: 'last_status_code', type: 'int', nullable: true })
  last_status_code!: number | null;

  @Column({ name: 'last_duration_ms', type: 'int', nullable: true })
  last_duration_ms!: number | null;

  @Column({ name: 'last_status', type: 'varchar', length: 20, nullable: true })
  last_status!: 'SUCCESS' | 'FAILURE' | null;

  @Column({ name: 'consecutive_failures', type: 'int', default: 0 })
  consecutive_failures!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany(() => CronJobLog, (log) => log.cron_job)
  logs!: CronJobLog[];
}
