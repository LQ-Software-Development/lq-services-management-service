import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Task } from "./task.entity";

@Entity()
export class TaskHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Task, (task) => task.history, { onDelete: "CASCADE" })
  task: Task;

  @Column()
  type: string; // Ex.: 'approval-criterion-updated', 'comment-added', 'status-changed'

  @Column({ type: "text", nullable: true })
  description?: string; // Detalhes ou comentário do evento

  @Column({ nullable: true })
  userId?: string; // ID do usuário que gerou o evento

  @CreateDateColumn()
  createdAt: Date;
}
