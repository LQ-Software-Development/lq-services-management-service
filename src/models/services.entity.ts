import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Schedule } from "./schedule.entity";

@Entity()
export class Services {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  index: number;

  @Column({
    nullable: process.env.SAAS_MODE === "true" ? false : true,
  })
  externalId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  timeExecution: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  servicePrice: number;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ default: true })
  status: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Schedule, (schedule) => schedule.service)
  schedules: Schedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
