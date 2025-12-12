import { InjectRepository } from "@nestjs/typeorm";
import { Schedule } from "src/models/schedule.entity";
import { Repository } from "typeorm";
import { UpdateScheduleDto } from "../dto/update-schedule.dto";
import { NotFoundException } from "@nestjs/common";

export class UpdateScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async execute({
    id,
    updateScheduleDto,
  }: {
    id: string;
    updateScheduleDto: UpdateScheduleDto;
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

    // Check if date is being changed
    let newIndexDay = schedule.indexDay;
    if (updateScheduleDto.date && updateScheduleDto.date !== schedule.date) {
      // Date is changing, recalculate indexDay for the new date
      const newDate = new Date(updateScheduleDto.date);
      const startOfDay = new Date(newDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(newDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get the max indexDay for the new date and add 1 (append to end)
      const maxIndexDay = await this.scheduleRepository
        .createQueryBuilder("schedule")
        .select("MAX(schedule.indexDay)", "max")
        .where("schedule.organizationId = :organizationId", {
          organizationId: schedule.organizationId,
        })
        .andWhere("schedule.date >= :startOfDay", { startOfDay })
        .andWhere("schedule.date <= :endOfDay", { endOfDay })
        .andWhere("schedule.deletedAt IS NULL")
        .getRawOne();

      newIndexDay = (maxIndexDay?.max || 0) + 1;
    }

    return this.scheduleRepository.save({
      ...schedule,
      ...updateScheduleDto,
      indexDay: newIndexDay,
    });
  }
}
