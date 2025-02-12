import { Controller, Patch, Param, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UpdateApprovalCriterionStatusDto } from "./dto/update-approval-criterion-status.dto";
import { UpdateApprovalCriterionStatusService } from "./services/update-approval-criterion-status.service";

@ApiTags("Critérios de Aprovação")
@Controller("approval-criteria")
export class ApprovalCriteriaController {
  constructor(
    private readonly updateApprovalCriterionStatusService: UpdateApprovalCriterionStatusService,
  ) {}

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() updateDto: UpdateApprovalCriterionStatusDto,
  ) {
    return this.updateApprovalCriterionStatusService.execute(id, updateDto);
  }
}
