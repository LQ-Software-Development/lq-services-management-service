import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  priority?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  price?: number;

  @Column({ nullable: true })
  deadline?: Date;

  @Column({ nullable: true })
  organizationId?: string;

  @OneToMany(() => Task, (task) => task.project)
  tasks?: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
