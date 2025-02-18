import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../../models/task.entity";
import { TaskTimeLog } from "../../models/task-timing-log.entity";
import { Project } from "../../models/project.entity";
import {
  CycleMetrics,
  ProjectDashboardDTO,
  ProjectHeaderDTO,
  ProjectRiskDTO,
  ProjectTrendDTO,
  TaskDistributionDTO,
  TaskTimelineDTO,
  TimeComparisonDTO,
} from "../dto/project-dashboard.dto";
import { Between } from "typeorm";
import { QualityMetricsDTO } from "../dto/manager-dashboard.dto";


@Injectable()
export class ProjectDashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskTimeLog)
    private readonly timeLogRepository: Repository<TaskTimeLog>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

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
    const cycles = await this.getProjectCycles(project);
    const qualityMetrics = await this.getProjectQualityMetrics(project);

    return {
      header,
      timeline,
      taskDistribution,
      timeComparison,
      risks,
      trends,
      filters,
      cycles,
      qualityMetrics,
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

    const averageDeliveryTime = await this.calculateAverageDeliveryTime(project);

    const qualityMetrics = await this.getProjectQualityMetrics(project);

    return {
      name: project.name,
      startDate: project.startDate,
      deadline: project.deadline,
      status: statusGeral,
      completionPercentage: projectProgress,
      approvalRate: criteriaApprovalRate,
      totalTasks,
      completedTasks,
      averageDeliveryTime,
      qualityMetrics,
    };
  }

  private async calculateAverageDeliveryTime(project: Project): Promise<number> {
    // Buscar todas as tasks completadas ordenadas por data de conclusão
    const completedTasks = await this.taskRepository.find({
      where: {
        project: { id: project.id },
        status: 'COMPLETED'
      },
      order: {
        updatedAt: 'ASC'
      }
    });

    if (completedTasks.length < 2) {
      return 0; // Não há entregas suficientes para calcular média
    }

    // Calcular a diferença de dias entre cada entrega
    let totalDays = 0;
    let intervals = 0;

    for (let i = 1; i < completedTasks.length; i++) {
      const currentDelivery = completedTasks[i].updatedAt;
      const previousDelivery = completedTasks[i - 1].updatedAt;

      const diffInDays = Math.ceil(
        (currentDelivery.getTime() - previousDelivery.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      // Só considera intervalos válidos (maior que 0 e menor que 365 dias)
      if (diffInDays > 0 && diffInDays < 365) {
        totalDays += diffInDays;
        intervals++;
      }
    }

    // Retorna a média em dias (arredondada para 1 casa decimal)
    return intervals > 0
      ? Math.round((totalDays / intervals) * 10) / 10
      : 0;
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

  private async getProjectCycles(project: Project): Promise<CycleMetrics[]> {
    // Encontra a data mais antiga entre startDate do projeto e a primeira task
    const oldestTask = await this.taskRepository.findOne({
      where: { project: { id: project.id } },
      order: { startDate: 'ASC' },
    });

    const startDate = oldestTask?.startDate || project.startDate;
    if (!startDate) return [];

    const cycles: CycleMetrics[] = [];
    const CYCLE_DAYS = 15;
    const TOTAL_CYCLES = 7;

    // Calcula a data de início do ciclo mais recente
    let currentCycleEnd = new Date();
    currentCycleEnd.setHours(23, 59, 59, 999);
    let currentCycleStart = new Date(currentCycleEnd);
    currentCycleStart.setDate(currentCycleEnd.getDate() - CYCLE_DAYS + 1);
    currentCycleStart.setHours(0, 0, 0, 0);

    // Busca os últimos 7 ciclos
    for (let i = 0; i < TOTAL_CYCLES; i++) {
      // Se o ciclo começar antes da data mais antiga do projeto, para o loop
      if (currentCycleStart < startDate) break;

      // Busca tasks completadas neste ciclo
      const completedTasks = await this.taskRepository.find({
        where: {
          project: { id: project.id },
          status: 'COMPLETED',
          updatedAt: Between(currentCycleStart, currentCycleEnd),
        },
        relations: ['timeLogs'],
      });

      // Calcula o esforço total (tempo estimado) das tasks completadas
      const deliveredEffort = completedTasks.reduce((total, task) => {
        return total + (task.value || 0);
      }, 0);

      // Calcula o tempo real gasto pelos desenvolvedores neste ciclo
      const actualMinutes = completedTasks.reduce((total, task) => {
        return total + task.timeLogs.reduce((timeTotal, log) => {
          return timeTotal + (log.totalMinutes || 0);
        }, 0);
      }, 0);

      // Calcula a eficiência (100% se o tempo real for igual ao estimado)
      const efficiency = deliveredEffort > 0
        ? Math.min((deliveredEffort / actualMinutes) * 100, 100)
        : 0;

      cycles.unshift({
        startDate: new Date(currentCycleStart),
        endDate: new Date(currentCycleEnd),
        deliveredEffort,
        completedTasks: completedTasks.length,
        efficiency,
        actualMinutes,
      });

      // Move para o ciclo anterior
      currentCycleEnd = new Date(currentCycleStart);
      currentCycleEnd.setDate(currentCycleEnd.getDate() - 1);
      currentCycleStart = new Date(currentCycleEnd);
      currentCycleStart.setDate(currentCycleStart.getDate() - CYCLE_DAYS + 1);
      currentCycleStart.setHours(0, 0, 0, 0);
    }

    return cycles;
  }

  private async getProjectQualityMetrics(project: Project): Promise<QualityMetricsDTO> {
    const completedTasks = await this.taskRepository.count({
      where: {
        project: { id: project.id },
        status: 'COMPLETED'
      }
    });

    const reopenedTasks = await this.taskRepository.count({
      where: {
        project: { id: project.id },
        status: 'COMPLETED',
        wasReopened: true
      }
    });

    return {
      reopenedTasksRate: completedTasks > 0
        ? (reopenedTasks / completedTasks) * 100
        : 0,
      totalReopenedTasks: reopenedTasks,
      totalCompletedTasks: completedTasks
    };
  }
}
