import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../../models/task.entity";
import { TaskTimeLog } from "../../models/task-timing-log.entity";
import {
  DeveloperDashboardDTO,
  AssignedTaskDetailedDTO,
  TimeLogDetailedDTO,
  ProductivityHistoryDTO,
  FeedbackDTO,
} from "../dto/developer-dashboard.dto";
import { TaskHistory } from "../../models/task-history.entity";

@Injectable()
export class DeveloperDashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskTimeLog)
    private readonly timeLogRepository: Repository<TaskTimeLog>,
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepository: Repository<TaskHistory>,
  ) {}

  async getDashboard(developerId: string): Promise<DeveloperDashboardDTO> {
    // Tarefas atribuídas com dados expandidos
    const assignedTasks = await this.taskRepository
      .createQueryBuilder("task")
      .leftJoin("task.assignments", "assignment")
      .where("assignment.userId = :developerId", { developerId })
      .select([
        "task.id",
        "task.title",
        "task.status",
        "task.value",
        "task.dueDate",
        "task.priority",
        "task.startDate",
        "task.endDate",
      ])
      .getMany();

    // Logs de tempo detalhados
    const timeLogs = await this.timeLogRepository
      .createQueryBuilder("timeLog")
      .leftJoinAndSelect("timeLog.task", "task")
      .where("timeLog.userId = :developerId", { developerId })
      .select([
        "timeLog.id",
        "timeLog.totalMinutes",
        "timeLog.startTime",
        "timeLog.endTime",
        "task.id",
        "task.title",
      ])
      .getMany();

    // Mapear tarefas atribuídas para o formato do DTO
    const mappedAssignedTasks: AssignedTaskDetailedDTO[] = assignedTasks.map(
      (task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        value: task.value,
        dueDate: task.dueDate,
        priority: task.priority as "LOW" | "MEDIUM" | "HIGH",
        startDate: task.startDate,
        endDate: task.endDate,
        estimatedTime: task.value,
      }),
    );

    // Mapear logs de tempo
    const mappedTimeLogs: TimeLogDetailedDTO[] = timeLogs.map((log) => ({
      id: log.id,
      totalMinutes: log.totalMinutes,
      date: log.startTime,
      startTime: log.startTime,
      endTime: log.endTime,
      taskId: log.task?.id,
      taskTitle: log.task?.title,
    }));

    // Calcular produtividade histórica (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const productivityHistory = await this.calculateProductivityHistory(
      developerId,
      thirtyDaysAgo,
      new Date(),
    );

    const completedTasks = mappedAssignedTasks.filter(
      (task) => task.status === "COMPLETED",
    );

    const wipTasks = mappedAssignedTasks.filter(
      (task) => task.status === "IN_PROGRESS",
    );

    // Calcular média de conclusão
    const averageCompletionTime =
      this.calculateAverageCompletionTime(mappedTimeLogs);

    // Mapear feedback
    const feedback = await this.mapTasksFeedback(developerId);

    const productivityIndicators = {
      totalAssigned: mappedAssignedTasks.length,
      totalCompleted: completedTasks.length,
      averageCompletionTime,
      wipCount: wipTasks.length,
    };

    // Adicionar busca do histórico de status
    const taskStatusHistory = await this.taskHistoryRepository
      .createQueryBuilder("history")
      .where("history.userId = :developerId", { developerId })
      .andWhere("history.type = :type", { type: "STATUS_CHANGE" })
      .orderBy("history.createdAt", "DESC")
      .getMany();

    return {
      assignedTasks: mappedAssignedTasks,
      completedTasks,
      averageCompletionTime,
      wipCount: wipTasks.length,
      workHistory: mappedTimeLogs,
      feedback,
      productivityIndicators,
      productivityHistory,
      taskStatusHistory: taskStatusHistory.map((history) => ({
        taskId: history.task.id,
        oldStatus: history.task.status,
        newStatus: history.task.status,
        changedAt: history.createdAt,
      })),
    };
  }

  private async calculateProductivityHistory(
    developerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProductivityHistoryDTO[]> {
    // Buscar dados agrupados por dia
    const dailyStats = await this.timeLogRepository
      .createQueryBuilder("timeLog")
      .select("DATE(timeLog.startTime)", "date")
      .addSelect("COUNT(DISTINCT task.id)", "completedTasks")
      .addSelect("AVG(timeLog.totalMinutes)", "averageTime")
      .addSelect("SUM(timeLog.totalMinutes)", "workingMinutes")
      .leftJoin("timeLog.task", "task")
      .where("timeLog.userId = :developerId", { developerId })
      .andWhere("timeLog.startTime BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("DATE(timeLog.startTime)")
      .getRawMany();

    return dailyStats.map((stat) => ({
      period: stat.date,
      completedTasks: Number(stat.completedTasks),
      averageCompletionTime: Number(stat.averageTime),
      workingHours: Number(stat.workingMinutes) / 60,
    }));
  }

  private calculateAverageCompletionTime(
    timeLogs: TimeLogDetailedDTO[],
  ): number {
    if (timeLogs.length === 0) return 0;
    const totalMinutes = timeLogs.reduce(
      (acc, log) => acc + log.totalMinutes,
      0,
    );
    return totalMinutes / timeLogs.length;
  }

  private async mapTasksFeedback(developerId: string): Promise<FeedbackDTO[]> {
    const tasksWithReviews = await this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.approvalCriteria", "approval")
      .leftJoin("task.assignments", "assignment")
      .where("assignment.userId = :developerId", { developerId })
      .getMany();

    return tasksWithReviews.flatMap((task) =>
      task.approvalCriteria.map((criteria) => ({
        taskId: task.id,
        comment: criteria.description,
        status: criteria.status as "APPROVED" | "PENDING" | "REJECTED",
      })),
    );
  }
}
