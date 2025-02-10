import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { ListTasksService } from './services/list-tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/models/task.entity';
import { GetTaskService } from './services/get-task.service';
import { EditTaskService } from './services/edit-task.service';
import { CountActiveTasksService } from './services/count-active-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [ListTasksService, GetTaskService, EditTaskService, CountActiveTasksService],
})
export class TasksModule { }
