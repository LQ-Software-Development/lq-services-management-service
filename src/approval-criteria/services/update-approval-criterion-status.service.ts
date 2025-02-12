import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApprovalCriterion } from "../../models/approval-criterion.entity";
import { UpdateApprovalCriterionStatusDto } from "../dto/update-approval-criterion-status.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class UpdateApprovalCriterionStatusService {
  constructor(
    @InjectRepository(ApprovalCriterion)
    private readonly approvalCriterionRepository: Repository<ApprovalCriterion>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    updateDto: UpdateApprovalCriterionStatusDto,
  ): Promise<ApprovalCriterion> {
    const criterion = await this.approvalCriterionRepository.findOne({
      where: { id },
      relations: ["task"],
    });
    if (!criterion) {
      throw new NotFoundException("Critério de aprovação não encontrado");
    }

    Object.assign(criterion, updateDto);
    criterion.reviewedAt = new Date();

    try {
      const updatedCriterion =
        await this.approvalCriterionRepository.save(criterion);

      this.eventEmitter.emit("approval.criterion.updated", {
        criterionId: updatedCriterion.id,
        taskId: updatedCriterion.task.id,
        comment: updateDto.comment,
        reviewerId: updatedCriterion.reviewedBy,
        status: updatedCriterion.status,
      });

      return updatedCriterion;
    } catch (error) {
      throw new InternalServerErrorException(
        "Erro ao atualizar o status do critério de aprovação",
      );
    }
  }
}
