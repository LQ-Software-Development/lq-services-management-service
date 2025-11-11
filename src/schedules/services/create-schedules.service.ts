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

    if (createScheduleDto.eachDayRepeat && createScheduleDto.finalRepeatDate) {
      const finalRepeatDate = new Date(createScheduleDto.finalRepeatDate);
      let date = new Date(createScheduleDto.date);
      const intervalType = createScheduleDto.intervalType || "day";

      while (date <= finalRepeatDate) {
        schedulesCount++;

        schedules.push({
          ...createScheduleDto,
          index: schedulesCount,
          date: date,
        });

        date = addInterval(date, createScheduleDto.eachDayRepeat, intervalType);
      }
    } else {
      delete createScheduleDto.eachDayRepeat;
      delete createScheduleDto.finalRepeatDate;

      schedules.push({
        ...createScheduleDto,
        index: schedulesCount + 1,
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
