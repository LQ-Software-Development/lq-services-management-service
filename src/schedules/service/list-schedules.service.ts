import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Between, Repository } from 'typeorm';

export class ListSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) { }

  execute({
    startDate,
    endDate,
    organizationId,
    clientId,
    assignedId,
  }: ListSchedulesServiceDto) {
    const whereClause = {};

    if (startDate && endDate) {
      whereClause['date'] = Between(startDate, endDate);
    }

    whereClause['organizationId'] = organizationId;
    whereClause['clientId'] = clientId;
    whereClause['assignedId'] = assignedId;

    return this.scheduleRepository.find({
      where: whereClause,
    });
  }
}

export interface ListSchedulesServiceDto {
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
  clientId?: string;
  assignedId?: string;
}
