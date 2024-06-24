import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../models/task.entity';
import { TasksController } from './tasks.controller';
import { CreateTaskService } from './services/create-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { DeleteTaskService } from './services/delete-task.service';
import { AddTaskLogService } from './services/add-task-log.service';
import { ChangeTaskStatusService } from './services/change-task-status.service';
import { StatusColumn } from 'src/models/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, StatusColumn])],
  controllers: [TasksController],
  providers: [
    CreateTaskService,
    UpdateTaskService,
    DeleteTaskService,
    AddTaskLogService,
    ChangeTaskStatusService,
  ],
})
export class TasksModule {}
