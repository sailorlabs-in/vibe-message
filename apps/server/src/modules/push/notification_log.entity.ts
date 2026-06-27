import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Notification } from './notification.entity';
import { DeviceToken } from '../device/device_token.entity';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'notification_id' })
  notification_id!: number;

  @ManyToOne('Notification', (notif: any) => notif.logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notification_id' })
  notification!: Notification;

  @Column({ name: 'device_token_id' })
  device_token_id!: number;

  @ManyToOne('DeviceToken', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_token_id' })
  device_token!: DeviceToken;

  @Column({ length: 20 })
  status!: 'PENDING' | 'SENT' | 'FAILED';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message!: string | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sent_at!: Date | null;
}
