import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.assignments, { onDelete: 'CASCADE' })
  task: Task;

  @Column()
  userId: string; // ID do usuário fornecido pelo microserviço de usuários

  @Column()
  userName: string; // Nome do usuário fornecido pelo microserviço de usuários

  @Column({ nullable: true })
  userAvatar?: string; // Avatar do usuário fornecido pelo microserviço de usuários

  @Column()
  role: string; // Exemplo: 'backend', 'frontend', 'designer'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;
}
