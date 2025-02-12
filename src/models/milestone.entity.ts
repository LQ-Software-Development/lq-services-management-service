import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Project } from "./project.entity";

@Entity()
export class Milestone {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "timestamp" })
  dueDate: Date;

  @Column({
    type: "enum",
    enum: ["PENDING", "COMPLETED"],
    default: "PENDING",
  })
  status: "PENDING" | "COMPLETED";

  @Column({
    type: "enum",
    enum: ["REVIEW", "DELIVERY", "DEADLINE"],
  })
  type: "REVIEW" | "DELIVERY" | "DEADLINE";

  @ManyToOne(() => Project, (project) => project.milestones)
  project: Project;
}
