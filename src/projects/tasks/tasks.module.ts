import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../models/task.entity';
import { TasksController } from './tasks.controller';
import { CreateTaskService } from './services/create-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { DeleteTaskService } from './services/delete-task.service';
import { AddTaskLogService } from './services/add-task-log.service';
import { ChangeTaskStatusService } from './services/change-task-status.service';
import { StatusColumn } from 'src/models/column.entity';
import { GetTasksService } from './services/get-tasks.service';
import { GetTaskService } from './services/get-task.service';
import { ApprovalCriterion } from 'src/models/approval-criterion.entity';
import { Project } from 'src/models/project.entity';
import { CountActiveTasksService } from '../../tasks/services/count-active-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, StatusColumn, ApprovalCriterion, Project])],
  controllers: [TasksController],
  providers: [
    CreateTaskService,
    GetTasksService,
    GetTaskService,
    UpdateTaskService,
    DeleteTaskService,
    AddTaskLogService,
    ChangeTaskStatusService,
    CountActiveTasksService,
  ],
})
export class TasksModule { }
