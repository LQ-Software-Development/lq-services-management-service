import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../../models/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  execute(createTaskDto: CreateTaskDto) {
    const id = randomUUID();

    try {
      const task = this.taskRepository.create({
        ...createTaskDto,
        id,
      });

      this.taskRepository.save(task);

      return { id };
    } catch (error) {
      throw new InternalServerErrorException('Error creating task');
    }
  }
}
