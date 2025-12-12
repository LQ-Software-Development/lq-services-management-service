import { Injectable } from "@nestjs/common";
import { CreateScheduleDto } from "../dto/create-schedule.dto";
import { Schedule } from "src/models/schedule.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm/repository/Repository";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { FinancialApiProvider } from "src/providers/financial-api.provider";

@Injectable()
export class CreateSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private financialApiProvider: FinancialApiProvider,
  ) {}

  async execute(createScheduleDto: CreateScheduleDto) {
    const schedules: Array<Schedule> = [];
    let schedulesCount = await this.scheduleRepository.countBy({
      organizationId: createScheduleDto.organizationId,
    });

    function addInterval(
      date: Date,
      amount: number,
      intervalType: string,
    ): Date {
      switch (intervalType) {
        case "week":
          return addWeeks(date, amount);
        case "month":
          return addMonths(date, amount);
        case "bi-weekly":
          return addDays(date, amount * 15);
        case "year":
          return addYears(date, amount);
        case "day":
        default:
          return addDays(date, amount);
      }
    }

    // Helper function to get indexDay for a specific date
    const getIndexDayForDate = async (date: Date): Promise<number> => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await this.scheduleRepository
        .createQueryBuilder("schedule")
        .where("schedule.organizationId = :organizationId", {
          organizationId: createScheduleDto.organizationId,
        })
        .andWhere("schedule.date >= :startOfDay", { startOfDay })
        .andWhere("schedule.date <= :endOfDay", { endOfDay })
        .andWhere("schedule.deletedAt IS NULL")
        .getCount();

      return count + 1;
    };

    if (createScheduleDto.eachDayRepeat && createScheduleDto.finalRepeatDate) {
      const finalRepeatDate = new Date(createScheduleDto.finalRepeatDate);
      let date = new Date(createScheduleDto.date);
      const intervalType = createScheduleDto.intervalType || "day";

      // Group schedules by date to calculate indexDay
      const schedulesByDate: Record<string, number> = {};

      while (date <= finalRepeatDate) {
        schedulesCount++;
        const dateKey = date.toISOString().split("T")[0];

        // Initialize or increment the counter for this date
        if (!schedulesByDate[dateKey]) {
          schedulesByDate[dateKey] = await getIndexDayForDate(date);
        }

        schedules.push({
          ...createScheduleDto,
          index: schedulesCount,
          indexDay: schedulesByDate[dateKey],
          date: date,
        });

        schedulesByDate[dateKey]++;
        date = addInterval(date, createScheduleDto.eachDayRepeat, intervalType);
      }
    } else {
      delete createScheduleDto.eachDayRepeat;
      delete createScheduleDto.finalRepeatDate;

      const indexDay = await getIndexDayForDate(
        new Date(createScheduleDto.date),
      );

      schedules.push({
        ...createScheduleDto,
        index: schedulesCount + 1,
        indexDay: indexDay,
        date: new Date(createScheduleDto.date),
      });
    }

    try {
      schedules.forEach(async (schedule) => {
        if (schedule.metadata?.amount) {
          await this.financialApiProvider.generateFinanicialTransaction({
            amount: schedule.metadata.amount,
            description: "OS" + schedule.index + " - " + schedule.description,
            date: new Date(schedule.date),
            organizationId: schedule.organizationId,
          });
        }
      });
    } catch (error) {
      return this.scheduleRepository.save(schedules);
    }

    return this.scheduleRepository.save(schedules);
  }
}
