import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  clientId?: string;

  @Column({ nullable: true })
  clientName?: string;

  @Column({ nullable: true })
  description?: string;

  // TODO: remove nullable
  @Column({ nullable: true })
  date: Date;

  @Column({ nullable: true })
  groupId?: string;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  serviceId?: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata?: Record<string, any>;
}
