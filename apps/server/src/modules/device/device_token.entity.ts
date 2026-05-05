import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { App } from "../app/app.entity";

@Entity("device_tokens")
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "app_id" })
  app_id!: number;

  @ManyToOne("App", (app: any) => app.devices, { onDelete: "CASCADE" })
  @JoinColumn({ name: "app_id" })
  app!: App;

  @Column({ name: "external_user_id", length: 255 })
  external_user_id!: string;

  @Column({ name: "subscription_json", type: "text" })
  subscription_json!: string;

  @Column({ length: 100, default: "UTC" })
  timezone!: string;

  @Column({ name: "is_active", default: true })
  is_active!: boolean;

  @CreateDateColumn({ name: "drip_anchor_date" })
  drip_anchor_date!: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}
