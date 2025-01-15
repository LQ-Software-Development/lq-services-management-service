import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';

export class ListSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) { }

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
  }: ListSchedulesServiceDto) {
    const whereClause: FindOptionsWhere<Schedule>[] = [];

    if (startDate && endDate) {
      whereClause.push({ date: Between(startDate, endDate) });
    }

    if (organizationId) {
      whereClause.push({ organizationId });
    }

    if (clientId) {
      whereClause.push({ clientId });
    }

    if (assignedId) {
      whereClause.push({ assignedId });
    }

    if (code && !isNaN(Number(code))) {
      whereClause.push({ index: Number(code) });
    }

    if (externalId) {
      whereClause.push({ externalId });
    }

    if (search && search.length > 0) {
      whereClause.push(
        { clientName: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) },
        { assignedName: ILike(`%${search}%`) },
        { service: { name: ILike(`%${search}%`) } },
      );
    }

    if (page && limit) {
      const [data, count] = await this.scheduleRepository.findAndCount({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        withDeleted: false,
        relations: ['service'],
        order: {
          date: 'DESC',
        },
      });

      return {
        data,
        count,
      };
    }

    return this.scheduleRepository.find({
      where: whereClause,
      withDeleted: false,
      relations: ['service'],
      order: {
        date: 'DESC',
      },
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
  search?: string;
}
