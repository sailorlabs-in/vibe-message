import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";

@Entity("warnings")
export class Warning {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "user_id" })
  user_id!: number;

  @ManyToOne("User", (user: any) => user.warnings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "text" })
  message!: string;

  @Column({ name: "created_by", nullable: true })
  created_by!: number;

  @ManyToOne("User", { onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @CreateDateColumn({ name: "created_at" })
  created_at!: Date;
}
