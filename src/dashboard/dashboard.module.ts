import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "../models/task.entity";
import { TaskTimeLog } from "../models/task-timing-log.entity";
import { TaskAssignment } from "../models/task-assignment.entity";
import { Project } from "../models/project.entity";
import { ProjectDashboardService } from "./services/project-dashboard.service";
import { DeveloperDashboardService } from "./services/developer-dashboard.service";
import { ManagerDashboardService } from "./services/manager-dashboard.service";
import { GlobalDashboardService } from "./services/global-dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { TaskHistory } from "src/models/task-history.entity";
import { ApprovalCriterion } from "src/models/approval-criterion.entity";
import { Milestone } from "src/models/milestone.entity";
import { ClientProjectDashboardService } from "./services/client-project-dashboard.service";
import { TaskComment } from "src/models/task-comment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskTimeLog,
      TaskAssignment,
      Project,
      TaskHistory,
      ApprovalCriterion,
      Milestone,
      TaskComment,
    ]),
  ],
  providers: [
    ProjectDashboardService,
    DeveloperDashboardService,
    ManagerDashboardService,
    GlobalDashboardService,
    ClientProjectDashboardService,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
