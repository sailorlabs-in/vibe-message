import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('apps')
export class App {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  user_id!: number;

  @ManyToOne('User', (user: any) => user.apps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'public_app_id', length: 50, unique: true })
  public_app_id!: string;

  @Column({ name: 'public_key', length: 100 })
  public_key!: string;

  @Column({ name: 'secret_key', length: 100 })
  secret_key!: string;

  @Column({ name: 'is_active', default: true })
  is_active!: boolean;

  @Column({ name: 'retention_days', type: 'int', nullable: true })
  retention_days!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany('DeviceToken', (device: any) => device.app)
  devices!: any[];

  @OneToMany('Notification', (notif: any) => notif.app)
  notifications!: any[];
}
