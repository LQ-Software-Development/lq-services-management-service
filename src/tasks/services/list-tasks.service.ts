import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Task } from "../../models/task.entity";
import { ListTasksFilterDto } from "../dto/list-tasks-filter.dto";

@Injectable()
export class ListTasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(filters: ListTasksFilterDto, organizationId: string) {
    const query = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("task.assignments", "assignments")
      .where("project.organizationId = :organizationId", { organizationId });

    if (filters.userId) {
      query.andWhere("assignments.userId = :userId", {
        userId: filters.userId,
      });
    }

    if (filters.projectId) {
      query.andWhere("task.projectId = :projectId", {
        projectId: filters.projectId,
      });
    }

    if (filters.status) {
      query.andWhere("task.status = :status", { status: filters.status });
    }

    if (filters.isNotComplete) {
      query.andWhere("task.status != :complete", { complete: "COMPLETED" });
    }

    if (filters.startDateFrom && filters.startDateTo) {
      query.andWhere({
        startDate: Between(filters.startDateFrom, filters.startDateTo),
      });
    } else if (filters.startDateFrom) {
      query.andWhere({ startDate: MoreThanOrEqual(filters.startDateFrom) });
    } else if (filters.startDateTo) {
      query.andWhere({ startDate: LessThanOrEqual(filters.startDateTo) });
    }

    if (filters.endDateFrom && filters.endDateTo) {
      query.andWhere({
        endDate: Between(filters.endDateFrom, filters.endDateTo),
      });
    } else if (filters.endDateFrom) {
      query.andWhere({ endDate: MoreThanOrEqual(filters.endDateFrom) });
    } else if (filters.endDateTo) {
      query.andWhere({ endDate: LessThanOrEqual(filters.endDateTo) });
    }

    if (filters.isActive !== undefined) {
      const today = new Date();
      if (filters.isActive) {
        query
          .andWhere("task.startDate <= :today", { today })
          .andWhere("task.endDate >= :today OR task.endDate IS NULL", {
            today,
          });
      } else {
        query.andWhere("task.startDate > :today OR task.endDate < :today", {
          today,
        });
      }
    }

    const [data, count] = await query
      .orderBy("task.startDate", "ASC")
      .getManyAndCount();

    return { data, count };
  }
}
