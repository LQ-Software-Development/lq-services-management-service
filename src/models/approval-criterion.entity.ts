import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class ApprovalCriterion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.approvalCriteria, {
    onDelete: 'CASCADE',
  })
  task: Task; // Relacionamento com a tarefa associada

  @Column()
  title: string; // Nome do critério (ex.: "Funcionalidade atende ao escopo")

  @Column({ type: 'text', nullable: true })
  description: string; // Detalhes do critério (ex.: "O botão deve salvar corretamente os dados no banco")

  @Column({ nullable: true })
  status?: string;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean; // Status de aprovação do critério

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string; // ID do usuário que realizou a revisão

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date; // Data em que o critério foi revisado
}
