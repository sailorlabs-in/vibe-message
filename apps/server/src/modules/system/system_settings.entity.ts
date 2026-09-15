import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'default_retention_days', default: 14 })
  default_retention_days!: number;

  @Column({ name: 'smtp_host', type: 'varchar', length: 255, nullable: true })
  smtp_host!: string | null;

  @Column({ name: 'smtp_port', type: 'int', nullable: true })
  smtp_port!: number | null;

  @Column({ name: 'smtp_secure', type: 'boolean', nullable: true })
  smtp_secure!: boolean | null;

  @Column({ name: 'smtp_user', type: 'varchar', length: 255, nullable: true })
  smtp_user!: string | null;

  @Column({ name: 'smtp_pass', type: 'varchar', length: 255, nullable: true })
  smtp_pass!: string | null;

  @Column({ name: 'smtp_from', type: 'varchar', length: 255, nullable: true })
  smtp_from!: string | null;

  @Column({ name: 'hide_forgot_password', type: 'boolean', default: false })
  hide_forgot_password!: boolean;

  @Column({ name: 'hide_email_verification', type: 'boolean', default: false })
  hide_email_verification!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
