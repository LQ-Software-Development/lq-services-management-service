import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskAssignment } from './task-assignment.entity';
import { TaskTimeLog } from './task-timing-log.entity';
import { ApprovalCriterion } from './approval-criterion.entity';
import { Project } from './project.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
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

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
