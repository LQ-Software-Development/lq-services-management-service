import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/models/task.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class GetTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async execute(id: string) {
    const isCode = !isUUID(id);

    const task = await this.taskRepository.findOne({
      where: {
        [isCode ? 'code' : 'id']: id,
      },
      relations: ['approvalCriteria', 'project', 'subtasks', 'parentTask', 'timeLogs', 'comments', 'assignments'],
    });
    return task;
  }
}
