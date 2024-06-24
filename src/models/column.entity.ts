import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { Board } from './board.entity';

@Entity()
export class StatusColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  isCompleted: boolean;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  taskLimit?: number;

  @ManyToOne(() => Board, (board) => board.columns)
  board: Board;

  @ManyToMany(() => Task, (task) => task.columns)
  @JoinTable()
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
