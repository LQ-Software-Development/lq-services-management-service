import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../../models/task.entity';
import { Repository } from 'typeorm';

export class AddTaskLogService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(taskId: string, log: string, type?: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      withDeleted: false,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.logs.push({
      author: {
        userId: 'SYSTEM',
        name: 'System',
      },
      date: new Date(),
      log: log,
      type: type || 'INFO',
    });

    this.taskRepository.save(task);
  }
}
