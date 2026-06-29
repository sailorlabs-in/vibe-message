import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'default_retention_days', default: 14 })
  default_retention_days!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
