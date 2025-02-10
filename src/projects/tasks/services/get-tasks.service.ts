import { Repository } from 'typeorm';
import { Task } from 'src/models/task.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class GetTasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async execute() {
    const tasks = await this.taskRepository.find();
    return tasks;
  }
}
