import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { App } from "../app/app.entity";
import { User } from "../user/user.entity";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "app_id" })
  app_id!: number;

  @ManyToOne("App", (app: any) => app.notifications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "app_id" })
  app!: App;

  @Column({ name: "payload_json", type: "text" })
  payload_json!: string;

  @Column({ name: "is_silent", default: false })
  is_silent!: boolean;

  @Column({ name: "scheduled_at_local_time", type: "time", nullable: true })
  scheduled_at_local_time!: string | null;

  @Column({ name: "created_by", nullable: true })
  created_by!: number | null;

  @ManyToOne("User")
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @OneToMany("NotificationLog", (log: any) => log.notification)
  logs!: any[];
}
