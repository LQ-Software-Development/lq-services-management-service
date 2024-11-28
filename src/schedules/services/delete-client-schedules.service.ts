import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../../models/schedule.entity';

@Injectable()
export class DeleteClientSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async execute(clientId: string): Promise<void> {
    try {
      await this.scheduleRepository.softDelete({ clientId });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao deletar os schedules do cliente',
      );
    }
  }
}
