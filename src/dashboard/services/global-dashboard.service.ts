import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../../models/task.entity";
import { TaskTimeLog } from "../../models/task-timing-log.entity";
import { Project } from "../../models/project.entity";

@Injectable()
export class GlobalDashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskTimeLog)
    private readonly timeLogRepository: Repository<TaskTimeLog>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async getDashboard(organizationId: string) {
    // Considerando que as tasks possuem uma relação com a organização, por exemplo:
    // where: { organization: { id: organizationId } }
    // Caso não haja essa relação diretamente, use apropriadamente o campo organizationId

    // Cálculo do percentual geral de conclusão
    const totalTasks = await this.taskRepository.count({
      where: { project: { organizationId } },
    });
    const completedTasks = await this.taskRepository.count({
      where: { project: { organizationId }, status: "COMPLETED" },
    });
    const overallCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Média de tempo de conclusão (a partir dos logs)
    const timeLogs = await this.timeLogRepository.find({
      where: { organizationId },
    });
    const totalMinutes = timeLogs.reduce(
      (acc, log) => acc + (log.totalMinutes || 0),
      0,
    );
    const averageCompletionTime =
      timeLogs.length > 0 ? totalMinutes / timeLogs.length : 0;

    // Indicadores de Qualidade: total de critérios de aprovação e taxa de aprovação
    const tasks = await this.taskRepository.find({
      where: { project: { organizationId } },
      relations: ["approvalCriteria"],
    });
    let totalCriteria = 0;
    let approvedCriteria = 0;
    tasks.forEach((task) => {
      if (task.approvalCriteria && task.approvalCriteria.length) {
        task.approvalCriteria.forEach((criterion) => {
          totalCriteria++;
          if (criterion.status === "APPROVED") {
            approvedCriteria++;
          }
        });
      }
    });
    const firstApprovalRate =
      totalCriteria > 0 ? (approvedCriteria / totalCriteria) * 100 : 0;

    // Valores simulados para bugs, rework, cobertura de testes e tempo de revisão
    const bugRate = 5; // bugs por 100 tasks (simulado)
    const reworkRate = 10; // %
    const testCoverage = 80; // %
    const reviewTime = 60; // minutos

    // Feedback consolidado (agregando comentários dos critérios de aprovação)
    const feedbackConsolidated = tasks
      .map((task) =>
        task.approvalCriteria
          ? task.approvalCriteria
              .map((criterion) => criterion.comment)
              .filter(Boolean)
          : [],
      )
      .flat();

    // Tendência: tarefas COMPLETED nos últimos 30 dias agrupadas por data
    const trends = await this.taskRepository
      .createQueryBuilder("task")
      .select("DATE(task.updatedAt)", "date")
      .addSelect("COUNT(*)", "completed")
      .where("task.status = :status", { status: "COMPLETED" })
      .andWhere("task.updatedAt >= NOW() - INTERVAL '30 days'")
      .groupBy("DATE(task.updatedAt)")
      .orderBy("DATE(task.updatedAt)", "ASC")
      .getRawMany();

    const qualityIndicators = {
      firstApprovalRate: 85, // Exemplo - implementar cálculo real
      bugRate: 5, // Exemplo - implementar cálculo real
      reworkRate: 10, // Exemplo - implementar cálculo real
      testCoverage: 80, // Exemplo - implementar cálculo real
      reviewTime: averageCompletionTime, // Usando o tempo médio como base
    };

    // Mapear tendências convertendo contagens para number
    const mappedTrends = trends.map((trend) => ({
      date: trend.date,
      completed: Number(trend.completed),
    }));

    return {
      overallCompletionRate,
      averageCompletionTime,
      qualityIndicators,
      feedbackConsolidated: tasks.flatMap(
        (task) =>
          task.approvalCriteria
            ?.map((criteria) => criteria.description)
            .filter(Boolean) || [],
      ),
      trends: mappedTrends,
      stakeholderSatisfaction: 4.5, // Exemplo - implementar cálculo real
    };
  }
}
