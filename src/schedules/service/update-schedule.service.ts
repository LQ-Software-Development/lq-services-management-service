import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Repository } from 'typeorm';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { NotFoundException } from '@nestjs/common';

export class UpdateScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async execute({
    id,
    updateScheduleDto,
  }: {
    id: string;
    updateScheduleDto: UpdateScheduleDto;
  }) {
    const schedule = await this.scheduleRepository.findOne({
      where: {
        id,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.scheduleRepository.save({
      ...schedule,
      ...updateScheduleDto,
    });
  }
}
