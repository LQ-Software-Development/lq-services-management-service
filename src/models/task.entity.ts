import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusColumn } from './column.entity';
import { InventoryItem } from 'src/inventory-items/entities/inventory-item.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resume: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-array' })
  logs: {
    type: string;
    author: {
      userId: string;
      name: string;
    };
    date: Date;
    log: string;
  }[];

  @Column({ nullable: true, type: 'simple-array' })
  assignedTo?: {
    userId: string;
    name: string;
    avatarUrl: string;
  }[];

  @Column()
  statusId: string;

  @ManyToOne(() => StatusColumn, (column) => column.tasks)
  status: StatusColumn;

  @Column({ nullable: true })
  parentTaskId?: string;

  @ManyToOne(() => Task, { nullable: true })
  parentTask?: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subTasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => InventoryItem, (inventoryItem) => inventoryItem.tasks, {
    cascade: true,
  })
  @JoinTable()
  inventoryItems: InventoryItem[];
}
