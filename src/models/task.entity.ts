import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TaskAssignment } from "./task-assignment.entity";
import { TaskTimeLog } from "./task-timing-log.entity";
import { ApprovalCriterion } from "./approval-criterion.entity";
import { Project } from "./project.entity";
import { TaskHistory } from "./task-history.entity";
import { TaskComment } from "./task-comment.entity";

@Entity()
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  index: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  value?: number;

  @OneToMany(() => TaskAssignment, (assignment) => assignment.task)
  assignments: TaskAssignment[];

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @OneToMany(() => Task, (task) => task.id)
  subtasks?: Task[];

  @ManyToOne(() => Task, (task) => task.id)
  parentTask?: Task;

  @OneToMany(() => TaskTimeLog, (timeLog) => timeLog.task)
  timeLogs: TaskTimeLog[];

  @OneToMany(() => ApprovalCriterion, (criterion) => criterion.task)
  approvalCriteria: ApprovalCriterion[];

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  customerId?: string;

  @Column({ type: 'jsonb', nullable: true })
  customerData?: Record<string, any>;

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  project?: Project;

  @OneToMany(() => TaskHistory, (history) => history.task)
  history: TaskHistory[];

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];

  @Column({ default: false })
  wasReopened: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
