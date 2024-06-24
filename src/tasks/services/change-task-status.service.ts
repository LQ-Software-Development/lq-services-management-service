import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../models/task.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ChangeTaskStatusDto } from '../dto/change-task-status.dto';
import { StatusColumn } from 'src/models/column.entity';

@Injectable()
export class ChangeTaskStatusService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(StatusColumn)
    private readonly statusColumnRepository: Repository<StatusColumn>,
  ) {}

  async execute(changeTaskStatusDto: ChangeTaskStatusDto) {
    const { taskId, statusId } = changeTaskStatusDto;

    try {
      const task = await this.taskRepository.findOne({
        relations: ['columns'],
        where: {
          id: taskId,
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const status = await this.statusColumnRepository.findOne({
        where: {
          id: statusId,
        },
      });

      task.columns.filter((column) => column.board.id !== status.board.id);
      task.columns.push(status);

      await task.logs.push({
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
