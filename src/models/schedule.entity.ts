import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Services } from './services.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

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
  assignedId?: string;

  @Column({ nullable: true })
  assignedName?: string;

  @Column({ nullable: true })
  serviceId?: string;

  @Column({ nullable: true })
  status?: string;

  @ManyToOne(() => Services, (service) => service.schedules)
  service?: Services;

  @Column({ nullable: true, type: 'jsonb' })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  index: number;
}
