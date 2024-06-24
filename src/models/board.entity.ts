import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { StatusColumn as BoardColumn } from './column.entity';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  externalId: string;

  @ManyToMany(() => BoardColumn, (column) => column.board)
  @JoinTable()
  columns: BoardColumn[];
}
