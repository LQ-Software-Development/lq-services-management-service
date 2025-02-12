import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  Headers,
} from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { CreateTaskService } from "./services/create-task.service";
import { UpdateTaskService } from "./services/update-task.service";
import { DeleteTaskService } from "./services/delete-task.service";
import { ApiTags } from "@nestjs/swagger";
import { AddLogDto } from "./dto/add-log.dto";
import { AddTaskLogService } from "./services/add-task-log.service";
import { ChangeTaskStatusService } from "./services/change-task-status.service";
import { ChangeTaskStatusDto } from "./dto/change-task-status.dto";
import { GetTasksService } from "./services/get-tasks.service";
import { GetTaskService } from "./services/get-task.service";
import { CountActiveTasksService } from "../../tasks/services/count-active-tasks.service";
import { AddTaskAssignmentDto } from "./dto/add-task-assignment.dto";
import { TaskAssignmentService } from "./services/task-assignment.service";

@ApiTags("Tasks")
@Controller("projects/:projectId/tasks")
export class TasksController {
  constructor(
    private readonly createTaskService: CreateTaskService,
    private readonly getTasksService: GetTasksService,
    private readonly getTaskService: GetTaskService,
    private readonly updateTaskService: UpdateTaskService,
    private readonly deleteTaskService: DeleteTaskService,
    private readonly addLogService: AddTaskLogService,
    private readonly changeTaskStatusService: ChangeTaskStatusService,
    private readonly countActiveTasksService: CountActiveTasksService,
    private readonly taskAssignmentService: TaskAssignmentService,
  ) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Param("projectId") projectId: string,
  ) {
    return this.createTaskService.execute(createTaskDto, projectId);
  }

  @Get()
  getTasks() {
    return this.getTasksService.execute();
  }

  @Get(":id")
  getTask(@Param("id") id: string) {
    return this.getTaskService.execute(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.updateTaskService.execute(updateTaskDto, id);
  }

  @Patch("add-log")
  addLog(@Body() addLogDto: AddLogDto) {
    return this.addLogService.execute(
      addLogDto.taskId,
      addLogDto.log,
      addLogDto.type,
    );
  }

  @Patch("change-status")
  changeTaskStatus(@Body() changeTaskStatusDto: ChangeTaskStatusDto) {
    return this.changeTaskStatusService.execute(changeTaskStatusDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.deleteTaskService.execute(id);
  }

  @Get("active-tasks/count")
  async countActiveTasks(@Headers("user-id") userId: string) {
    return this.countActiveTasksService.execute(userId);
  }

  @Post(":taskId/assignments")
  async addAssignment(
    @Param("taskId") taskId: string,
    @Body() assignmentDto: AddTaskAssignmentDto,
  ) {
    return this.taskAssignmentService.addAssignment(taskId, assignmentDto);
  }

  @Delete(":taskId/assignments/:userId")
  async removeAssignment(
    @Param("taskId") taskId: string,
    @Param("userId") userId: string,
  ) {
    return this.taskAssignmentService.removeAssignment(taskId, userId);
  }
}
