import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Schedule } from "src/models/schedule.entity";
import { ReorderSchedulesDayDto } from "../dto/reorder-schedules-day.dto";

@Injectable()
export class ReorderSchedulesDayService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(reorderSchedulesDayDto: ReorderSchedulesDayDto) {
    const { date, movedItemId, newPosition } = reorderSchedulesDayDto;

    // Parse the date to start and end of day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch all schedules for the specified date, ordered by current indexDay
    const schedulesForDay = await this.scheduleRepository
      .createQueryBuilder("schedule")
      .where("schedule.date >= :startOfDay", { startOfDay })
      .andWhere("schedule.date <= :endOfDay", { endOfDay })
      .andWhere("schedule.deletedAt IS NULL")
      .orderBy("schedule.indexDay", "ASC")
      .addOrderBy("schedule.createdAt", "ASC")
      .addOrderBy("schedule.id", "ASC")
      .getMany();

    if (schedulesForDay.length === 0) {
      throw new NotFoundException(`No schedules found for date ${date}`);
    }

    // Find the moved item
    const movedItemIndex = schedulesForDay.findIndex(
      (s) => s.id === movedItemId,
    );

    if (movedItemIndex === -1) {
      throw new NotFoundException(
        `Schedule with id ${movedItemId} not found on date ${date}`,
      );
    }

    // Validate new position
    if (newPosition < 1 || newPosition > schedulesForDay.length) {
      throw new BadRequestException(
        `Invalid position ${newPosition}. Must be between 1 and ${schedulesForDay.length}`,
      );
    }

    // Remove the moved item from its current position
    const [movedItem] = schedulesForDay.splice(movedItemIndex, 1);

    // Insert at new position (newPosition is 1-based, array is 0-based)
    schedulesForDay.splice(newPosition - 1, 0, movedItem);

    // Execute updates in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update indexDay for all schedules in the new order
      for (let i = 0; i < schedulesForDay.length; i++) {
        await queryRunner.manager.update(Schedule, schedulesForDay[i].id, {
          indexDay: i + 1, // 1-based indexing
        });
      }

      await queryRunner.commitTransaction();

      return {
        message: "Schedule reordered successfully for the day",
        updatedSchedules: schedulesForDay.map((s, index) => ({
          id: s.id,
          indexDay: index + 1,
        })),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
