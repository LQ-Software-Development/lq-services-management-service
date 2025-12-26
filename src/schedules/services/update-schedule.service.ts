import { InjectRepository } from "@nestjs/typeorm";
import { Schedule } from "src/models/schedule.entity";
import { Repository } from "typeorm";
import { UpdateScheduleDto } from "../dto/update-schedule.dto";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { HrApiProvider } from "src/providers/hr-api.provider";

@Injectable()
export class UpdateScheduleService {
  private readonly logger = new Logger(UpdateScheduleService.name);
  private readonly doneStatus = process.env.DONE_STATUS?.toLowerCase();

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly hrApiProvider: HrApiProvider,
  ) { }

  async execute({
    id,
    updateScheduleDto,
    bearerToken,
  }: {
    id: string;
    updateScheduleDto: UpdateScheduleDto;
    bearerToken?: string;
  }) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
    });

    const typeSchedule = schedule?.metadata?.services?.[0]?.name
      ?.toLowerCase()
      ?.includes("system check");

    if (
      !typeSchedule &&
      updateScheduleDto.metadata &&
      "systemCheck" in updateScheduleDto.metadata
    ) {
      delete updateScheduleDto.metadata.systemCheck;
    }

    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }

    if (schedule.status === "in-progress") {
      const participantId = updateScheduleDto["participantId"];
      if (
        participantId &&
        schedule.assignedId &&
        participantId !== schedule.assignedId
      ) {
        throw new Error(
          "Only the schedule owner can update when status is in-progress",
        );
      }
    }

    const previousStatus = schedule.status?.toLowerCase();
    const newStatus = updateScheduleDto.status?.toLowerCase();

    console.log(
      `[HR Integration Debug] Schedule ${id}: previousStatus="${previousStatus}", newStatus="${newStatus}", doneStatus="${this.doneStatus}", hasToken=${!!bearerToken}, serviceId="${schedule.serviceId}"`,
    );

    const savedSchedule = await this.scheduleRepository.save({
      ...schedule,
      ...updateScheduleDto,
    });

    // Check if status transitioned to "done" status
    if (
      this.doneStatus &&
      bearerToken &&
      previousStatus !== this.doneStatus &&
      newStatus === this.doneStatus &&
      savedSchedule.serviceId
    ) {
      this.logger.log(
        `Status transitioned to "${this.doneStatus}" for schedule ${id}, calling HR API`,
      );
      await this.hrApiProvider.stopTimeLogByService(
        savedSchedule.serviceId,
        bearerToken,
      );
    } else {
      this.logger.log(
        `[HR Integration Debug] Skipping HR API call - conditions not met`,
      );
    }

    return savedSchedule;
  }
}
