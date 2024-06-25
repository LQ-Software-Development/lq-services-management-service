import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  modelId?: string;

  @Column({ nullable: true })
  ownerId?: string;

  @Column({ nullable: true })
  ownerName?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  serialNumber?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  brandName?: string;

  @Column({ nullable: true })
  brandId?: string;

  @Column({ nullable: true })
  contractEnds?: Date;

  @Column({ nullable: true })
  observation?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
