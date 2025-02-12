import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TaskHistoryService } from "./task-history.service";

@ApiTags("Histórico da Tarefa")
@Controller("tasks/:taskId/history")
export class TaskHistoryController {
  constructor(private readonly taskHistoryService: TaskHistoryService) {}

  @Get()
  async getTaskHistory(@Param("taskId") taskId: string) {
    return await this.taskHistoryService.getHistoryForTask(taskId);
  }
}
