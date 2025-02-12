import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class TaskTimeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.timeLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  task?: Task;

  @Column()
  userId: string; // ID do usuário (vindo do microserviço de usuários)

  @Column({ type: 'timestamp' })
  startTime: Date; // Hora de início do trabalho

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date; // Hora de término do trabalho

  @Column({ type: 'int', default: 0 })
  totalMinutes: number; // Total de minutos trabalhados (calculado)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  loggedAt: Date; // Registro da entrada no log

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  organizationId: string;
}
