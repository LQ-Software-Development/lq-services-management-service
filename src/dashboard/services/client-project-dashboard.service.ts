import { Injectable } from "@nestjs/common";
import { Task } from "src/models/task.entity";
import { Repository } from "typeorm";
import { ClientProjectDashboardDTO } from "../dto/client-project-dashboard.dto";
import { ClientProjectHeaderDTO } from "../dto/client-project-dashboard.dto";
import { ClientDeliverableDTO } from "../dto/client-project-dashboard.dto";
import { Project } from "src/models/project.entity";
import { NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientRiskDTO } from "../dto/client-project-dashboard.dto";
import { ClientCommunicationDTO } from "../dto/client-project-dashboard.dto";
import { ClientNextStepsDTO } from "../dto/client-project-dashboard.dto";

@Injectable()
export class ClientProjectDashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getDashboard(
    projectId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      showCompleted?: boolean;
    },
  ): Promise<ClientProjectDashboardDTO> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ["tasks", "tasks.approvalCriteria", "tasks.comments"],
    });

    if (!project) {
      throw new NotFoundException("Projeto não encontrado");
    }

    const header = await this.getProjectHeader(project);
    const deliverables = await this.getDeliverables(project, filters);
    const risks = await this.getProjectRisks(project);
    const communication = await this.getCommunicationHistory(project);
    const nextSteps = await this.getNextSteps(project);

    return {
      header,
      deliverables,
      risks,
      communication,
      nextSteps,
      filters,
    };
  }

  private async getProjectHeader(
    project: Project,
  ): Promise<ClientProjectHeaderDTO> {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(
      (t) => t.status === "COMPLETED",
    ).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const nextDelivery = project.tasks
      .filter((t) => t.status !== "COMPLETED" && t.dueDate)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]?.dueDate;

    return {
      name: project.name,
      status: this.calculateProjectStatus(project, progress),
      startDate: project.startDate,
      deadline: project.deadline,
      completionPercentage: progress,
      lastUpdate: project.updatedAt,
      nextDeliveryDate: nextDelivery,
    };
  }

  private async getDeliverables(
    project: Project,
    filters?: { startDate?: Date; endDate?: Date; showCompleted?: boolean },
  ): Promise<ClientDeliverableDTO[]> {
    let query = this.taskRepository
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId: project.id })
      .leftJoinAndSelect("task.approvalCriteria", "criteria")
      .leftJoinAndSelect("task.comments", "comments");

    if (filters?.startDate) {
      query = query.andWhere("task.dueDate >= :startDate", {
        startDate: filters.startDate,
      });
    }
    if (filters?.endDate) {
      query = query.andWhere("task.dueDate <= :endDate", {
        endDate: filters.endDate,
      });
    }
    if (filters?.showCompleted === false) {
      query = query.andWhere("task.status != :status", { status: "COMPLETED" });
    }

    const tasks = await query.getMany();

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      status: this.mapTaskStatus(task.status),
      approvalStatus: this.calculateApprovalStatus(task),
      comments: task.comments?.map((c) => c.content) || [],
      completionPercentage:
        task.status === "COMPLETED"
          ? 100
          : task.status === "IN_PROGRESS"
            ? 50
            : 0,
    }));
  }

  private calculateProjectStatus(
    project: Project,
    progress: number,
  ): "NO_PRAZO" | "EM_RISCO" | "ATRASADO" {
    const now = new Date();
    if (project.deadline && now > project.deadline && progress < 100) {
      return "ATRASADO";
    }
    if (progress < 80 && project.deadline && now < project.deadline) {
      return "EM_RISCO";
    }
    return "NO_PRAZO";
  }

  private mapTaskStatus(
    status: string,
  ): "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED" {
    switch (status) {
      case "COMPLETED":
        return "COMPLETED";
      case "IN_PROGRESS":
        return "IN_PROGRESS";
      case "BLOCKED":
        return "DELAYED";
      default:
        return "PENDING";
    }
  }

  private calculateApprovalStatus(
    task: Task,
  ): "APPROVED" | "IN_REVIEW" | "PENDING" {
    if (!task.approvalCriteria?.length) return "PENDING";
    const approved = task.approvalCriteria.every(
      (c) => c.status === "APPROVED",
    );
    const inReview = task.approvalCriteria.some(
      (c) => c.status === "IN_REVIEW",
    );
    return approved ? "APPROVED" : inReview ? "IN_REVIEW" : "PENDING";
  }

  private async getProjectRisks(project: Project): Promise<ClientRiskDTO[]> {
    const risks: ClientRiskDTO[] = [];

    // Verifica atrasos
    const delayedTasks = project.tasks.filter(
      (t) => t.dueDate && t.dueDate < new Date() && t.status !== "COMPLETED",
    );
    if (delayedTasks.length > 0) {
      risks.push({
        type: "DELAY",
        severity: "HIGH",
        description: `${delayedTasks.length} tarefas atrasadas`,
        impact: "Pode afetar o prazo final do projeto",
      });
    }

    // Verifica qualidade
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
        severity: "MEDIUM",
        description: "Baixa taxa de aprovação em revisões",
        impact: "Pode requerer retrabalho",
      });
    }

    return risks;
  }

  private async getCommunicationHistory(
    project: Project,
  ): Promise<ClientCommunicationDTO[]> {
    return project.tasks
      .filter((t) => t.comments?.length > 0)
      .flatMap((t) =>
        t.comments.map((c) => ({
          date: c.createdAt,
          type: "UPDATE",
          message: c.content,
          from: c.author,
          requiresAction: false,
        })),
      );
  }

  private async getNextSteps(project: Project): Promise<ClientNextStepsDTO[]> {
    const upcomingTasks = project.tasks
      .filter((t) => t.status !== "COMPLETED" && t.dueDate)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);

    return upcomingTasks.map((t) => ({
      date: t.dueDate,
      type: "DELIVERY",
      description: t.title,
    }));
  }
}
