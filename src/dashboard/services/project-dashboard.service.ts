import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../../models/task.entity";
import { TaskTimeLog } from "../../models/task-timing-log.entity";
import { Project } from "../../models/project.entity";
import {
  ProjectDashboardDTO,
  ProjectHeaderDTO,
  ProjectRiskDTO,
  ProjectTrendDTO,
  TaskDistributionDTO,
  TaskTimelineDTO,
  TimeComparisonDTO,
} from "../dto/project-dashboard.dto";

@Injectable()
export class ProjectDashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskTimeLog)
    private readonly timeLogRepository: Repository<TaskTimeLog>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getDashboard(
    projectId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      taskStatus?: string[];
    },
  ): Promise<ProjectDashboardDTO> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["tasks", "tasks.timeLogs"],
    });

    if (!project) {
      throw new NotFoundException("Projeto não encontrado");
    }

    const header = await this.getProjectHeader(project);
    const timeline = await this.getTaskTimeline(project, filters);
    const taskDistribution = await this.getTaskDistribution(project);
    const timeComparison = await this.getTimeComparison(project);
    const risks = await this.analyzeProjectRisks(project);
    const trends = await this.getProjectTrends(
      project,
      filters?.startDate,
      filters?.endDate,
    );

    return {
      header,
      timeline,
      taskDistribution,
      timeComparison,
      risks,
      trends,
      filters,
    };
  }

  private async analyzeProjectRisks(
    project: Project,
  ): Promise<ProjectRiskDTO[]> {
    const risks: ProjectRiskDTO[] = [];

    // Análise de atrasos
    const delayedTasks = project.tasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < new Date() &&
        task.status !== "COMPLETED",
    );

    if (delayedTasks.length > 0) {
      risks.push({
        type: "DELAY",
        severity: delayedTasks.length > 5 ? "HIGH" : "MEDIUM",
        description: `${delayedTasks.length} tarefas atrasadas`,
        affectedTasks: delayedTasks.map((t) => t.id),
      });
    }

    // Análise de qualidade
    const lowQualityTasks = project.tasks.filter((task) => {
      if (!task.approvalCriteria?.length) return false;
      const approvedCount = task.approvalCriteria.filter(
        (c) => c.status === "APPROVED",
      ).length;
      const approvalRate = (approvedCount / task.approvalCriteria.length) * 100;
      return approvalRate < 70;
    });

    if (lowQualityTasks.length > 0) {
      risks.push({
        type: "QUALITY",
        severity: "HIGH",
        description: "Baixa taxa de aprovação em revisões",
        affectedTasks: lowQualityTasks.map((t) => t.id),
      });
    }

    return risks;
  }

  private async getProjectHeader(project: Project): Promise<ProjectHeaderDTO> {
    // Progresso do Projeto: percentual de tarefas COMPLETED entre o total de tarefas do projeto.
    const totalTasks = await this.taskRepository.count({
      where: { project: { id: project.id } },
    });
    const completedTasks = await this.taskRepository.count({
      where: {
        project: { id: project.id },
        status: "COMPLETED",
      },
    });
    const projectProgress =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Indicadores de Critérios de Aprovação
    const tasksWithCriteria = await this.taskRepository.find({
      where: { project: { id: project.id } },
      relations: ["approvalCriteria"],
    });
    let totalCriteria = 0;
    let approvedCriteria = 0;
    tasksWithCriteria.forEach((task) => {
      if (task.approvalCriteria && task.approvalCriteria.length) {
        task.approvalCriteria.forEach((criterion) => {
          totalCriteria++;
          if (criterion.status === "APPROVED") {
            approvedCriteria++;
          }
        });
      }
    });
    const criteriaApprovalRate =
      totalCriteria > 0 ? (approvedCriteria / totalCriteria) * 100 : 0;

    // Cálculo do status geral do projeto
    const now = new Date();
    const statusGeral =
      project.deadline && now > project.deadline && projectProgress < 100
        ? "ATRASADO"
        : projectProgress < 80 && project.deadline && now < project.deadline
          ? "EM_RISCO"
          : "NO_PRAZO";

    return {
      name: project.name,
      startDate: project.startDate,
      deadline: project.deadline,
      status: statusGeral,
      completionPercentage: projectProgress,
      approvalRate: criteriaApprovalRate,
      totalTasks,
      completedTasks,
    };
  }

  private async getTaskTimeline(
    project: Project,
    filters?: { startDate?: Date; endDate?: Date; taskStatus?: string[] },
  ): Promise<TaskTimelineDTO[]> {
    const query = this.taskRepository
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId: project.id });

    if (filters?.startDate) {
      query.andWhere("task.startDate >= :startDate", {
        startDate: filters.startDate,
      });
    }
    if (filters?.endDate) {
      query.andWhere("task.dueDate <= :endDate", { endDate: filters.endDate });
    }
    if (filters?.taskStatus?.length) {
      query.andWhere("task.status IN (:...statuses)", {
        statuses: filters.taskStatus,
      });
    }

    const tasks = await query
      .select([
        "task.id",
        "task.title",
        "task.startDate",
        "task.dueDate",
        "task.status",
      ])
      .orderBy("task.startDate", "ASC")
      .getMany();

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      startDate: task.startDate,
      dueDate: task.dueDate,
      status: task.status,
      dependencies: [],
      completionPercentage: task.status === "COMPLETED" ? 100 : 0,
    }));
  }

  private async getTaskDistribution(
    project: Project,
  ): Promise<TaskDistributionDTO[]> {
    // Tarefas por Status: considerando BACKLOG, IN_PROGRESS, COMPLETED e BLOCKED.
    const statuses = ["BACKLOG", "IN_PROGRESS", "COMPLETED", "BLOCKED"];
    const tasksByStatus = statuses.reduce(async (acc, status) => {
      acc[status] = await this.taskRepository.count({
        where: { project: { id: project.id }, status },
      });
      return acc;
    }, {});

    return Object.entries(tasksByStatus).map(([status, count]) => ({
      status,
      count: Number(count) || 0,
      blockedCount: status === "BLOCKED" ? Number(count) : 0,
    }));
  }

  private async getTimeComparison(
    project: Project,
  ): Promise<TimeComparisonDTO[]> {
    // Tempo Estimado vs. Tempo Real: utilizando a propriedade estimatedTime (em minutos) e logs de tempo.
    const tasks = await this.taskRepository.find({
      where: { project: { id: project.id } },
      select: ["id", "title", "value"],
    });
    const timeLogs = await this.timeLogRepository
      .createQueryBuilder("log")
      .leftJoin("log.task", "task")
      .where("task.project = :projectId", { projectId: project.id })
      .getMany();
    const totalRealMinutes = timeLogs.reduce(
      (acc, log) => acc + (log.totalMinutes || 0),
      0,
    );
    let totalEstimatedMinutes = 0;
    tasks.forEach((task) => {
      totalEstimatedMinutes += task.value || 0;
    });

    return [
      {
        taskId: tasks[0].id,
        title: tasks[0].title,
        estimatedMinutes: totalEstimatedMinutes,
        actualMinutes: totalRealMinutes,
        variance: totalEstimatedMinutes - totalRealMinutes,
      },
    ];
  }

  private async getProjectTrends(
    project: Project,
    startDate: Date,
    endDate: Date,
  ): Promise<ProjectTrendDTO[]> {
    return this.taskRepository
      .createQueryBuilder("task")
      .select("DATE(task.updatedAt)", "date")
      .addSelect(
        "COUNT(CASE WHEN task.status = 'COMPLETED' THEN 1 END)",
        "completedTasks",
      )
      .addSelect("SUM(timeLog.totalMinutes)", "timeSpent")
      .leftJoin("task.timeLogs", "timeLog")
      .where("task.projectId = :projectId", { projectId: project.id })
      .andWhere("task.updatedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("DATE(task.updatedAt)")
      .orderBy("DATE(task.updatedAt)", "ASC")
      .getRawMany();
  }
}
