import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { Services } from "./models/services.entity";
import { ConfigModule } from "@nestjs/config";
import { ServicesModule } from "./services/services.module";
import { ColumnsModule } from "./columns/columns.module";
import { StatusColumn } from "./models/column.entity";
import { TasksModule as ProjectTasks } from "./projects/tasks/tasks.module";
import { Task } from "./models/task.entity";
import { BoardsModule } from "./boards/boards.module";
import { Board } from "./models/board.entity";
import { InventoryItemsModule } from "./inventory-items/inventory-items.module";
import { InventoryItem } from "./inventory-items/entities/inventory-item.entity";
import { SchedulesModule } from "./schedules/schedules.module";
import { Schedule } from "./models/schedule.entity";
import { ProjectsModule } from "./projects/projects.module";
import { ApprovalCriterion } from "./models/approval-criterion.entity";
import { TaskTimeLog } from "./models/task-timing-log.entity";
import { TaskAssignment } from "./models/task-assignment.entity";
import { Project } from "./models/project.entity";
import { TasksModule } from "./tasks/tasks.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { OrganizationIdInterceptor } from "./interceptors/organization-id.interceptor";
import { TimeLogsModule } from "./time-logs/time-logs.module";
import { ApprovalCriteriaModule } from "./approval-criteria/approval-criteria.module";
import { TaskHistory } from "./models/task-history.entity";
import { TaskHistoryModule } from "./task-history/task-history.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DashboardModule } from "./dashboard/dashboard.module";
import { Milestone } from "./models/milestone.entity";
import { TaskComment } from "./models/task-comment.entity";
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [
        Services,
        StatusColumn,
        Task,
        Board,
        InventoryItem,
        Schedule,
        Project,
        TaskAssignment,
        TaskTimeLog,
        ApprovalCriterion,
        TaskHistory,
        Milestone,
        TaskComment,
      ],
      synchronize: true,
    }),
    ServicesModule,
    ColumnsModule,
    TasksModule,
    BoardsModule,
    InventoryItemsModule,
    SchedulesModule,
    ProjectsModule,
    ProjectTasks,
    TimeLogsModule,
    ApprovalCriteriaModule,
    TaskHistoryModule,
    DashboardModule,
    EventEmitterModule.forRoot({
      // configurações opcionais, caso necessário
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: OrganizationIdInterceptor,
    },
  ],
})
export class AppModule {}
