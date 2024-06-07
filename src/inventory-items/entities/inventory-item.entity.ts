import { Task } from 'src/models/task.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  serialNumber: string;

  @Column({ nullable: true })
  code?: string;

  @Column()
  ownerId: string;

  @Column()
  ownerName: string;

  @Column()
  modelId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => Task, (task) => task.inventoryItems)
  tasks: Task[];

  // @ManyToOne(() => Model, (model) => model.inventoryItems)
}
