import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { App } from '../app/app.entity';
import { DeviceToken } from '../device/device_token.entity';

@Entity('drip_campaigns')
export class DripCampaign {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'app_id' })
  app_id!: number;

  @ManyToOne('App', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'app_id' })
  app!: App;

  @Column({ length: 255 })
  name!: string;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany('DripStep', (step: any) => step.campaign)
  steps!: any[];
}

@Entity('drip_steps')
export class DripStep {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'campaign_id' })
  campaign_id!: number;

  @ManyToOne('DripCampaign', (campaign: any) => campaign.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign!: DripCampaign;

  @Column({ name: 'step_number' })
  step_number!: number;

  @Column({ name: 'delay_days', default: 0 })
  delay_days!: number;

  @Column({ name: 'notification_payload_json', type: 'text' })
  notification_payload_json!: string;

  @Column({ name: 'scheduled_at_local_time', type: 'time', nullable: true })
  scheduled_at_local_time!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}

@Entity('drip_sent_logs')
@Unique(['drip_step_id', 'device_token_id'])
export class DripSentLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'drip_step_id' })
  drip_step_id!: number;

  @ManyToOne('DripStep', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'drip_step_id' })
  drip_step!: DripStep;

  @Column({ name: 'device_token_id' })
  device_token_id!: number;

  @ManyToOne('DeviceToken', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_token_id' })
  device_token!: DeviceToken;

  @Column({
    name: 'sent_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sent_at!: Date;
}
