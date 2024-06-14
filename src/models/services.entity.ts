import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Services {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  index: number;

  @Column({
    nullable: process.env.SAAS_MODE === 'true' ? false : true,
  })
  externalId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  timeExecution: number;

  @Column()
  servicePrice: number;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column({ default: true })
  status: boolean;

  @ManyToMany(() => Task, (task) => task.services)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
