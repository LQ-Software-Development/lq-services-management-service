import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../../../models/task.entity';
import { Repository } from 'typeorm';
import { UpdateTaskDto } from '../dto/update-task.dto';

@Injectable()
export class UpdateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  execute(updateTaskDto: UpdateTaskDto, id: string) {
    try {
      this.taskRepository.update(id, updateTaskDto);

      return { message: 'Task updated successfully', id };
    } catch (error) {
      throw new InternalServerErrorException('Error editing task');
    }
  }
}
