import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  password_hash!: string;

  @Column({ length: 20 })
  role!: 'SUPER_ADMIN' | 'ADMIN';

  @Column({ length: 20, default: 'PENDING' })
  status!: 'PENDING' | 'APPROVED' | 'BANNED';

  @Column({ name: 'app_limit', type: 'int', nullable: true })
  app_limit!: number | null;

  @Column({ name: 'can_manage_retention', default: false })
  can_manage_retention!: boolean;

  @Column({ name: 'enterprise_key', type: 'varchar', length: 255, nullable: true })
  enterprise_key!: string | null;

  @Column({ name: 'enterprise_key_requested', default: false })
  enterprise_key_requested!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @OneToMany('App', (app: any) => app.user)
  apps!: any[];

  @OneToMany('Warning', (warning: any) => warning.user)
  warnings!: any[];
}
