import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusColumn } from './column.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({ nullable: true, type: 'jsonb' })
  client?: {
    id: string;
    name: string;
    address: string;
  };

  @Column({ nullable: true })
  value?: number;

  @Column({ nullable: true, type: 'jsonb' })
  assignedTo?: {
    userId: string;
    name: string;
    avatarUrl: string;
  }[];

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  stockId?: string;

  @Column({ type: 'jsonb', default: [] })
  logs: {
    type: string;
    author: {
      userId: string;
      name: string;
    };
    date: Date;
    log: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  services: {
    name: string;
    serviceId: string;
    amount: number;
  }[];

  @Column({ nullable: true, type: 'jsonb' })
  item?: {
    id: string;
    serialNumber: string;
    name: string;
  };

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  deadline?: Date;

  // Relations
  @ManyToMany(() => StatusColumn, (column) => column.tasks)
  columns: StatusColumn[];

  @OneToMany(() => Task, (task) => task.parentTask)
  subTasks: Task[];

  @ManyToOne(() => Task, (task) => task.subTasks)
  parentTask: Task;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
