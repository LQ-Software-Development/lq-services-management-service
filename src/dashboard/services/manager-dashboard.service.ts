import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository, Not } from "typeorm";
import { Task } from "../../models/task.entity";
import { TaskAssignment } from "../../models/task-assignment.entity";
import { Project } from "../../models/project.entity";
import { TaskTimeLog } from "../../models/task-timing-log.entity";
import { ApprovalCriterion } from "../../models/approval-criterion.entity";
import {
  ManagerDashboardDTO,
  ProjectOverviewDTO,
  TeamMemberPerformanceDTO,
  QualityMetricsDTO,
  WorkloadDTO,
  TrendDataDTO,
  RiskAlertDTO,
} from "../dto/manager-dashboard.dto";

@Injectable()
@Injectable()
export class ManagerDashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(TaskAssignment)
    private readonly assignmentRepository: Repository<TaskAssignment>,
    @InjectRepository(TaskTimeLog)
    private readonly timeLogRepository: Repository<TaskTimeLog>,
    @InjectRepository(ApprovalCriterion)
    private readonly approvalCriterionRepository: Repository<ApprovalCriterion>,
  ) { }

  async getDashboard(
    organizationId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      projectIds?: string[];
      developerIds?: string[];
    },
  ): Promise<ManagerDashboardDTO> {
    // Período padrão: últimos 30 dias se não especificado
    const endDate = filters?.endDate || new Date();
    const startDate =
      filters?.startDate ||
      new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Desempenho da Equipe
    const teamPerformance = await this.getTeamPerformance(
      organizationId,
      startDate,
      endDate,
    );

    // 2. Visão dos Projetos
    const projects = await this.getProjectsOverview(organizationId);

    // 3. Métricas de Qualidade
    const quality = await this.getQualityMetrics(
      organizationId,
      startDate,
      endDate,
    );

    // 4. Análise de Carga de Trabalho
    const workload = await this.getWorkloadAnalysis(organizationId);

    // 5. Tendências
    const trends = await this.getTrends(organizationId, startDate, endDate);

    // 6. Riscos e Alertas
    const risks = await this.getRisksAndAlerts(organizationId);

    return {
      teamPerformance,
      projects,
      quality,
      workload,
      trends,
      risks,
      filters: {
        startDate,
        endDate,
        projectIds: filters?.projectIds,
        developerIds: filters?.developerIds,
      },
    };
  }

  private async getTeamPerformance(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    members: TeamMemberPerformanceDTO[];
    totalCompletedTasks: number;
    averageTeamPerformance: number;
  }> {
    const members = await this.assignmentRepository
      .createQueryBuilder("assignment")
      .select("assignment.userId", "developerId")
      .addSelect("COUNT(DISTINCT task.id)", "completedTasks")
      .addSelect('AVG(task_time_log."totalMinutes")', "averageCompletionTime")
      .addSelect(
        "COUNT(CASE WHEN task.status = 'REOPENED' THEN 1 END)",
        "reopenedTasks",
      )
      .addSelect(
        'AVG(CASE WHEN task.value > 0 THEN task_time_log."totalMinutes"/task.value END)',
        "efficiencyRate",
      )
      .addSelect("COUNT(DISTINCT project.id)", "projectsInvolved")
      .leftJoin("assignment.task", "task")
      .leftJoin("task.project", "project")
      .leftJoin("task.timeLogs", "task_time_log")
      .where("task.status = :status", { status: "COMPLETED" })
      .andWhere("project.organizationId = :organizationId", { organizationId })
      .andWhere("task.updatedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("assignment.userId")
      .getRawMany();

    return {
      members: await Promise.all(
        members.map(async (member) => ({
          developerId: member.developerid,
          completedTasks: Number(member.completedtasks),
          averageCompletionTime: Number(member.averagecompletiontime) || 0,
          activeTasksCount: await this.getActiveTasks(member.developerid),
          reviewApprovalRate: await this.getApprovalRate(member.developerid),
          reopenedTasks: Number(member.reopenedtasks) || 0,
          efficiencyRate: Number(member.efficiencyrate) || 0,
          projectsInvolved: Number(member.projectsinvolved) || 0,
        })),
      ),
      totalCompletedTasks: members.reduce(
        (acc, member) => acc + Number(member.completedtasks),
        0,
      ),
      averageTeamPerformance:
        members.length > 0
          ? members.reduce(
            (acc, member) => acc + Number(member.completedtasks),
            0,
          ) / members.length
          : 0,
    };
  }

  private async getProjectsOverview(organizationId: string): Promise<{
    active: ProjectOverviewDTO[];
    delayedCount: number;
    atRiskCount: number;
  }> {
    const projects = await this.projectRepository.find({
      where: { organizationId, status: Not("COMPLETED") },
      relations: ["tasks"],
    });

    const projectsOverview = await Promise.all(
      projects.map(async (project) => {
        const completedTasks = project.tasks.filter(
          (task) => task.status === "COMPLETED",
        ).length;
        const totalTasks = project.tasks.length;
        const completionPercentage =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const status = this.calculateProjectStatus(
          project,
          completionPercentage,
        );
        const delayedTasks = project.tasks.filter(
          (task) =>
            task.status !== "COMPLETED" &&
            task.dueDate &&
            task.dueDate < new Date(),
        ).length;

        const blockedTasks = project.tasks.filter(
          (task) => task.status === "BLOCKED",
        ).length;

        return {
          id: project.id,
          name: project.name,
          status,
          completionPercentage,
          startDate: project.startDate,
          deadline: project.deadline,
          delayedTasks,
          blockedTasks,
        };
      }),
    );

    return {
      active: projectsOverview,
      delayedCount: projectsOverview.filter((p) => p.status === "ATRASADO")
        .length,
      atRiskCount: projectsOverview.filter((p) => p.status === "EM_RISCO")
        .length,
    };
  }

  private async getQualityMetrics(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    overall: QualityMetricsDTO;
    byProject: Record<string, QualityMetricsDTO>;
  }> {
    const criteria = await this.approvalCriterionRepository
      .createQueryBuilder("criterion")
      .leftJoinAndSelect("criterion.task", "task")
      .leftJoinAndSelect("task.project", "project")
      .where("project.organizationId = :organizationId", { organizationId })
      .andWhere("task.updatedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getMany();

    const calculateMetrics = (
      criteriaList: ApprovalCriterion[],
    ): QualityMetricsDTO => {
      const total = criteriaList.length;
      const approved = criteriaList.filter(
        (c) => c.status === "APPROVED",
      ).length;
      const reworked = criteriaList.filter(
        (c) => c.status === "REJECTED",
      ).length;

      return {
        reopenedTasksRate: total > 0 ? (reworked / total) * 100 : 0,
        totalReopenedTasks: reworked,
        totalCompletedTasks: approved,
      };
    };

    const overall = calculateMetrics(criteria);
    const byProject: Record<string, QualityMetricsDTO> = {};

    const projectIds = [...new Set(criteria.map((c) => c.task.project.id))];
    for (const projectId of projectIds) {
      const projectCriteria = criteria.filter(
        (c) => c.task.project.id === projectId,
      );
      byProject[projectId] = calculateMetrics(projectCriteria);
    }

    return { overall, byProject };
  }

  private async getWorkloadAnalysis(
    organizationId: string,
  ): Promise<WorkloadDTO> {
    const [backlog, inProgress] = await Promise.all([
      this.taskRepository.count({
        where: {
          project: { organizationId },
          status: "BACKLOG",
        },
      }),
      this.taskRepository.count({
        where: {
          project: { organizationId },
          status: "IN_PROGRESS",
        },
      }),
    ]);

    // Capacidade baseada em média histórica ou configuração
    const teamCapacity = 100; // Implementar cálculo real baseado em histórico

    return {
      totalBacklog: backlog,
      inProgress,
      teamCapacity,
      overloadAlert: inProgress > teamCapacity,
    };
  }

  private async getTrends(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    daily: TrendDataDTO[];
    weekly: TrendDataDTO[];
    monthly: TrendDataDTO[];
  }> {
    const dailyTrends = await this.taskRepository
      .createQueryBuilder("task")
      .select("DATE(task.updatedAt)", "period")
      .addSelect("COUNT(*)", "completedTasks")
      .leftJoin("task.project", "project")
      .where("task.status = :status", { status: "COMPLETED" })
      .andWhere("project.organizationId = :organizationId", { organizationId })
      .andWhere("task.updatedAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("DATE(task.updatedAt)")
      .orderBy("DATE(task.updatedAt)", "ASC")
      .getRawMany();

    // Implementar agregações semanais e mensais
    return {
      daily: dailyTrends.map((trend) => ({
        period: trend.period,
        completedTasks: Number(trend.completedTasks),
        approvalRate: 0, // Implementar
        reworkRate: 0, // Implementar
        averageCompletionTime: 0, // Implementar
      })),
      weekly: [], // Implementar
      monthly: [], // Implementar
    };
  }

  private async getRisksAndAlerts(
    organizationId: string,
  ): Promise<{ critical: RiskAlertDTO[]; warnings: RiskAlertDTO[] }> {
    const risks: RiskAlertDTO[] = [];

    // Verificar projetos atrasados
    const delayedProjects = await this.projectRepository.find({
      where: {
        organizationId,
        deadline: LessThan(new Date()),
        status: Not("COMPLETED"),
      },
    });

    if (delayedProjects.length > 0) {
      risks.push({
        type: "DELAY",
        severity: "HIGH",
        message: `${delayedProjects.length} projetos com prazo expirado`,
        affectedItems: delayedProjects.map((p) => ({
          id: p.id,
          type: "PROJECT",
          name: p.name,
        })),
      });
    }

    // Separar riscos críticos e avisos
    const critical = risks.filter((r) => r.severity === "HIGH");
    const warnings = risks.filter((r) => r.severity !== "HIGH");

    return { critical, warnings };
  }

  private calculateProjectStatus(
    project: Project,
    completionPercentage: number,
  ): "NO_PRAZO" | "EM_RISCO" | "ATRASADO" {
    const now = new Date();
    if (
      project.deadline &&
      now > project.deadline &&
      completionPercentage < 100
    ) {
      return "ATRASADO";
    }
    if (
      completionPercentage < 80 &&
      project.deadline &&
      now < project.deadline
    ) {
      return "EM_RISCO";
    }
    return "NO_PRAZO";
  }

  private async getActiveTasks(developerId: string): Promise<number> {
    return await this.taskRepository.count({
      where: {
        assignments: {
          userId: developerId,
        },
        status: "IN_PROGRESS",
      },
    });
  }

  private async getApprovalRate(developerId: string): Promise<number> {
    const criteria = await this.approvalCriterionRepository
      .createQueryBuilder("criterion")
      .leftJoin("criterion.task", "task")
      .leftJoin("task.assignments", "assignment")
      .where("assignment.userId = :developerId", { developerId })
      .getMany();

    if (criteria.length === 0) return 0;

    const approved = criteria.filter((c) => c.status === "APPROVED").length;
    return (approved / criteria.length) * 100;
  }
}
