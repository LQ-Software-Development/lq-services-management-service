import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/models/task.entity';

@Injectable()
export class GetTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async execute(id: string) {
    const task = await this.taskRepository.findOne({
      where: [{ id }, { code: id }],
      relations: ['approvalCriteria', 'project', 'assignments'],
    });
    return task;
  }
}
