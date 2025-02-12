import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApprovalCriterion } from "../models/approval-criterion.entity";
import { ApprovalCriteriaController } from "./approval-criteria.controller";
import { UpdateApprovalCriterionStatusService } from "./services/update-approval-criterion-status.service";

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalCriterion])],
  controllers: [ApprovalCriteriaController],
  providers: [UpdateApprovalCriterionStatusService],
})
export class ApprovalCriteriaModule {}
