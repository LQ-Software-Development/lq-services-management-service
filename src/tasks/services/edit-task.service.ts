import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "src/models/task.entity";
import { UpdateTaskDto } from "src/projects/tasks/dto/update-task.dto";
import { Repository } from "typeorm";

@Injectable()
export class EditTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(updateTaskDto: UpdateTaskDto, id: string) {
    return await this.taskRepository.update(id, updateTaskDto);
  }
}
