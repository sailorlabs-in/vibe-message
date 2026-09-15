import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CronJob } from './cron-job.entity';

@Entity('cron_job_logs')
export class CronJobLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: 'cron_job_id' })
  cron_job_id!: number;

  @ManyToOne(() => CronJob, (job) => job.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cron_job_id' })
  cron_job!: CronJob;

  @Column({ name: 'triggered_at', type: 'timestamp with time zone' })
  triggered_at!: Date;

  @Column({ name: 'duration_ms', type: 'int' })
  duration_ms!: number;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  status_code!: number | null;

  @Column({ type: 'varchar', length: 20 })
  status!: 'SUCCESS' | 'FAILURE';

  @Column({ type: 'jsonb', nullable: true })
  response_headers!: Record<string, string> | null;

  @Column({ type: 'text', nullable: true })
  response_body!: string | null;

  @Column({ type: 'text', nullable: true })
  error_message!: string | null;

  @Column({ name: 'is_manual', default: false })
  is_manual!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
