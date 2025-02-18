import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApprovalCriterion } from "../models/approval-criterion.entity";
import { ApprovalCriteriaController } from "./approval-criteria.controller";
import { UpdateApprovalCriterionStatusService } from "./services/update-approval-criterion-status.service";
import { Task } from "src/models/task.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalCriterion, Task])],
  controllers: [ApprovalCriteriaController],
  providers: [UpdateApprovalCriterionStatusService],
})
export class ApprovalCriteriaModule { }
