import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Schedule } from "src/models/schedule.entity";
import { ReorderSchedulesDto } from "../dto/reorder-schedules.dto";

@Injectable()
export class ReorderSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async execute(reorderSchedulesDto: ReorderSchedulesDto) {
    const { items } = reorderSchedulesDto;
    const ids = items.map((item) => item.id);

    // Validate all schedules exist
    const existingSchedules = await this.scheduleRepository.find({
      where: { id: In(ids) },
      select: ["id"],
    });

    const existingIds = existingSchedules.map((schedule) => schedule.id);
    const missingIds = ids.filter((id) => !existingIds.includes(id));

    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Schedules not found: ${missingIds.join(", ")}`,
      );
    }

    // Execute updates in a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of items) {
        await queryRunner.manager.update(Schedule, item.id, {
          index: item.newIndex,
        });
      }

      await queryRunner.commitTransaction();

      return { message: "Schedules reordered successfully" };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
