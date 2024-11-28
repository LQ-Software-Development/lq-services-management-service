import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Between, Repository } from 'typeorm';

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
  }: ListSchedulesServiceDto) {
    const whereClause = {};

    if (startDate && endDate) {
      whereClause['date'] = Between(startDate, endDate);
    }

    whereClause['organizationId'] = organizationId;
    whereClause['clientId'] = clientId;
    whereClause['assignedId'] = assignedId;
    whereClause['index'] =
      code && !isNaN(Number(code)) ? Number(code) : undefined;
    whereClause['externalId'] = externalId;

    if (page && limit) {
      const [data, count] = await this.scheduleRepository.findAndCount({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        withDeleted: false,
      });

      return {
        data,
        count,
      };
    }

    return this.scheduleRepository.find({
      where: whereClause,
      withDeleted: false,
    });
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
}
