import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskHistory } from "../models/task-history.entity";
import { TaskHistoryService } from "./task-history.service";
import { TaskHistoryController } from "./task-history.controller";
import { TaskEventsListener } from "./task-events.listener";

@Module({
  imports: [TypeOrmModule.forFeature([TaskHistory])],
  providers: [TaskHistoryService, TaskEventsListener],
  controllers: [TaskHistoryController],
  exports: [TaskHistoryService],
})
export class TaskHistoryModule {}
