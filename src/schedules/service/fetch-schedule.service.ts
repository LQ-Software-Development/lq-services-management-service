import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Repository } from 'typeorm';

export class FetchScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async execute({ id }: { id: string }): Promise<Schedule> {
    return this.scheduleRepository.findOne({
      where: {
        id,
      },
      relations: ['service'],
    });
  }
}
