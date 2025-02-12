import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TaskHistory } from "../models/task-history.entity";

@Injectable()
export class TaskHistoryService {
  constructor(
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
  ) {}

  async createHistory(
    taskId: string,
    type: string,
    description?: string,
    userId?: string,
  ): Promise<TaskHistory> {
    try {
      const history = this.taskHistoryRepository.create({
        task: { id: taskId } as any,
        type,
        description,
        userId,
      });
      return await this.taskHistoryRepository.save(history);
    } catch (error) {
      throw new InternalServerErrorException(
        "Erro ao criar histórico da tarefa",
      );
    }
  }

  async getHistoryForTask(taskId: string): Promise<TaskHistory[]> {
    try {
      return await this.taskHistoryRepository.find({
        where: { task: { id: taskId } },
        order: { createdAt: "ASC" },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Erro ao buscar histórico da tarefa",
      );
    }
  }
}
