import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from 'src/models/schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
  ) {}

  execute(id: string) {
    return this.schedulesRepository.delete(id);
  }
}
