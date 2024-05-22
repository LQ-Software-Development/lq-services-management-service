import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/models/task.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ChangeTaskStatusDto } from '../dto/change-task-status.dto';

@Injectable()
export class ChangeTaskStatusService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(changeTaskStatusDto: ChangeTaskStatusDto) {
    const { taskId, statusId } = changeTaskStatusDto;

    try {
      const task = await this.taskRepository.findOne({
        where: {
          id: taskId,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      task.statusId = statusId;
      task.logs.push({
        author: {
          name: 'System',
          userId: 'system',
        },
        date: new Date(),
        log: 'Mudança de status',
        type: 'INFO',
      });

      this.taskRepository.save(task);
    } catch (err) {
      throw new InternalServerErrorException('Error changing task status');
    }
  }
}
