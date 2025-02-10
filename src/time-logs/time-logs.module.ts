import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskTimeLog } from '../models/task-timing-log.entity';
import { Task } from '../models/task.entity';
import { Project } from '../models/project.entity';
import { TimeLogsController } from './time-logs.controller';
import { CreateTimeLogService } from './services/create-time-log.service';
import { ListTimeLogsService } from './services/list-time-logs.service';

@Module({
    imports: [TypeOrmModule.forFeature([TaskTimeLog, Task, Project])],
    controllers: [TimeLogsController],
    providers: [CreateTimeLogService, ListTimeLogsService],
})
export class TimeLogsModule { } 
