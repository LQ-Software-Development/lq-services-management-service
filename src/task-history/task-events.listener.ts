import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TaskHistoryService } from "./task-history.service";

@Injectable()
export class TaskEventsListener {
  constructor(private readonly taskHistoryService: TaskHistoryService) {}

  @OnEvent("approval.criterion.updated")
  async handleApprovalCriterionUpdatedEvent(payload: {
    criterionId: string;
    taskId: string;
    comment?: string;
    reviewerId?: string;
    status: string;
  }) {
    const description = `Critério atualizado para: ${payload.status}${
      payload.comment ? `. Comentário: ${payload.comment}` : ""
    }`;

    // Registra o evento na timeline da tarefa associada
    await this.taskHistoryService.createHistory(
      payload.taskId,
      "approval-criterion-updated",
      description,
      payload.reviewerId,
    );
  }

  // Exemplo de listener para alteração de status da task
  @OnEvent("task.status.changed")
  async handleTaskStatusChanged(payload: {
    taskId: string;
    oldStatus: string;
    newStatus: string;
    userId?: string;
  }) {
    const description = `Status alterado de ${payload.oldStatus} para ${payload.newStatus}`;
    await this.taskHistoryService.createHistory(
      payload.taskId,
      "task-status-changed",
      description,
      payload.userId,
    );
  }
}
