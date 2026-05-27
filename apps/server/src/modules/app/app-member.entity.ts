import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { App } from "./app.entity";
import { User } from "../user/user.entity";

@Entity("app_members")
@Unique(["app_id", "user_id"])
export class AppMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "app_id" })
  app_id!: number;

  @ManyToOne("App", { onDelete: "CASCADE" })
  @JoinColumn({ name: "app_id" })
  app!: App;

  @Column({ name: "user_id" })
  user_id!: number;

  @ManyToOne("User", { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ length: 20 })
  role!: "owner" | "moderator" | "viewer";

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at!: Date;
}
