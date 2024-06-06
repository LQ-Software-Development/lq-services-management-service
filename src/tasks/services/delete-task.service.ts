import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../../models/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  execute(id: string) {
    try {
      this.taskRepository.softDelete(id);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting task');
    }
  }
}
