import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../../../models/task.entity";
import { TaskAssignment } from "../../../models/task-assignment.entity";
import { AddTaskAssignmentDto } from "../dto/add-task-assignment.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class TaskAssignmentService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly taskAssignmentRepository: Repository<TaskAssignment>,
    private eventEmitter: EventEmitter2,
  ) {}

  async addAssignment(taskId: string, assignmentDto: AddTaskAssignmentDto) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException("Tarefa não encontrada");
    }

    const assignment = this.taskAssignmentRepository.create({
      task,
      userId: assignmentDto.userId,
      userName: assignmentDto.userName,
      userAvatar: assignmentDto.userAvatar,
      role: assignmentDto.role,
    });

    await this.taskAssignmentRepository.save(assignment);

    this.eventEmitter.emit("task.assignment.added", {
      taskId,
      userId: assignmentDto.userId,
      userName: assignmentDto.userName,
    });

    return assignment;
  }

  async removeAssignment(taskId: string, userId: string) {
    const assignment = await this.taskAssignmentRepository.findOne({
      where: {
        task: { id: taskId },
        userId: userId,
      },
    });

    if (!assignment) {
      throw new NotFoundException("Atribuição não encontrada");
    }

    await this.taskAssignmentRepository.remove(assignment);

    this.eventEmitter.emit("task.assignment.removed", {
      taskId,
      userId,
    });

    return { message: "Atribuição removida com sucesso" };
  }
}
