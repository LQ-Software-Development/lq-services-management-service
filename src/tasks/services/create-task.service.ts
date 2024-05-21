import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "src/models/task.entity";
import { Repository } from "typeorm";
import { CreateTaskDto } from "../dto/create-task.dto";
import { v4 as uuid } from "uuid";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class CreateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) { }

  execute(createTaskDto: CreateTaskDto) {
    const id = uuid();

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
