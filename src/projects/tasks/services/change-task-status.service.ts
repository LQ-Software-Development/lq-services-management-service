import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../../../models/task.entity";
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ChangeTaskStatusDto } from "../dto/change-task-status.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ChangeTaskStatusService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private eventEmitter: EventEmitter2,
  ) {}

  async execute(changeTaskStatusDto: ChangeTaskStatusDto) {
    const { taskId, statusId } = changeTaskStatusDto;

    try {
      const task = await this.taskRepository.findOne({
        relations: ["columns"],
        where: {
          id: taskId,
        },
      });

      if (!task) {
        throw new NotFoundException("Task not found");
      }

      // const status = await this.statusColumnRepository.findOne({
      //   where: {
      //     id: statusId,
      //   },
      // });

      // task.columns.filter((column) => column.board.id !== status.board.id);
      // task.columns.push(status);

      // await task.logs.push({
      //   author: {
      //     name: 'System',
      //     userId: 'system',
      //   },
      //   date: new Date(),
      //   log: 'Mudança de status',
      //   type: 'INFO',
      // });

      const oldStatus = task.status;
      task.status = statusId; // Supondo que o statusId seja o novo status

      await this.taskRepository.save(task);

      // Emite o evento de mudança de status
      this.eventEmitter.emit("task.status.changed", {
        taskId: task.id,
        oldStatus,
        newStatus: task.status,
        userId: "algum-user-id", // ajuste conforme necessário
      });
    } catch (err) {
      throw new InternalServerErrorException("Error changing task status");
    }
  }
}
