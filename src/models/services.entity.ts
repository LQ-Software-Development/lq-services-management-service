import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
