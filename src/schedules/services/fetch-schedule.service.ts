import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Repository } from 'typeorm';

export class FetchScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) { }

  async execute({ id }: { id: string }): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: {
        id,
        deletedAt: null
      },
      withDeleted: false,
      relations: ['service'],
    });

    if (!schedule)
      throw new NotFoundException('Schedule not found');

    return schedule;
  }
}
