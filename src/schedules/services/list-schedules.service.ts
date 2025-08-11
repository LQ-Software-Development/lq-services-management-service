import { InjectRepository } from "@nestjs/typeorm";
import { Schedule } from "src/models/schedule.entity";
import { Repository } from "typeorm";

export class ListSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async execute({
    startDate,
    endDate,
    organizationId,
    clientId,
    assignedId,
    code,
    page,
    limit,
    externalId,
    search,
    searchYacht,
    sort,
    order,
    status,
  }: ListSchedulesServiceDto) {
    const queryBuilder = this.scheduleRepository.createQueryBuilder("schedule");

    queryBuilder.leftJoinAndSelect("schedule.service", "service");

    if (startDate && endDate) {
      queryBuilder.andWhere("schedule.date BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    if (organizationId) {
      queryBuilder.andWhere("schedule.organizationId = :organizationId", {
        organizationId,
      });
    }

    if (clientId) {
      queryBuilder.andWhere("schedule.clientId = :clientId", { clientId });
    }

    if (assignedId) {
      queryBuilder.andWhere("schedule.assignedId = :assignedId", {
        assignedId,
      });
    }

    if (code && !isNaN(Number(code))) {
      queryBuilder.andWhere("schedule.index = :code", { code: Number(code) });
    }

    if (externalId) {
      queryBuilder.andWhere("schedule.externalId = :externalId", {
        externalId,
      });
    }

    if (status) {
      queryBuilder.andWhere("schedule.status = :status", { status });
    }

    if (search && search.length > 0) {
      queryBuilder.andWhere(
        "(schedule.clientName ILIKE :search OR schedule.description ILIKE :search OR schedule.assignedName ILIKE :search OR service.name ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    if (searchYacht && searchYacht.length > 0) {
      queryBuilder.andWhere(
        `(
              schedule.clientName ILIKE :searchYacht OR
              service.name ILIKE :searchYacht OR
              (schedule.metadata->'yachts' IS NOT NULL AND schedule.metadata->'yachts'->>'model' ILIKE :searchYacht) OR
              (
                schedule.metadata->'yachts' IS NOT NULL AND jsonb_typeof(schedule.metadata->'yachts') = 'array' AND EXISTS (
                  SELECT 1 FROM jsonb_array_elements(schedule.metadata->'yachts') AS yacht
                  WHERE yacht->>'model' ILIKE :search
                )
              )
            )`,
        { searchYacht: `%${searchYacht}%` },
      );
    }

    queryBuilder.orderBy(
      `schedule.${sort || "date"}`,
      (order?.toUpperCase() as "ASC" | "DESC") || "DESC",
    );

    if (page && limit) {
      queryBuilder.skip((page - 1) * limit).take(limit);
      const [data, count] = await queryBuilder.getManyAndCount();

      return {
        data,
        count,
      };
    }

    return queryBuilder.getMany();
  }
}

export interface ListSchedulesServiceDto {
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
  clientId?: string;
  assignedId?: string;
  code?: string;
  externalId?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  searchYacht?: string;
  order?: "asc" | "desc";
  status?: string;
}
