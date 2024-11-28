import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Schedule } from 'src/models/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { addDays } from 'date-fns';
import { FinancialApiProvider } from 'src/providers/financial-api.provider';

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

    if (createScheduleDto.eachDayRepeat && createScheduleDto.finalRepeatDate) {
      const finalRepeatDate = new Date(createScheduleDto.finalRepeatDate);
      let date = new Date(createScheduleDto.date);

      while (date <= finalRepeatDate) {
        schedulesCount++;

        schedules.push({
          ...createScheduleDto,
          index: schedulesCount,
          date: date,
        });

        date = addDays(date, createScheduleDto.eachDayRepeat);
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
            description: 'OS' + schedule.index + ' - ' + schedule.description,
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
