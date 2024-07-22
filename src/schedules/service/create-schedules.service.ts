import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Schedule } from 'src/models/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { addDays } from 'date-fns';

@Injectable()
export class CreateSchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  execute(createScheduleDto: CreateScheduleDto) {
    const schedules = [];

    if (createScheduleDto.eachDayRepeat && createScheduleDto.finalRepeatDate) {
      const finalRepeatDate = new Date(createScheduleDto.finalRepeatDate);
      let date = new Date(createScheduleDto.date);

      while (date <= finalRepeatDate) {
        schedules.push({
          ...createScheduleDto,
          date: date.toISOString(),
        });

        date = addDays(date, createScheduleDto.eachDayRepeat);
      }
    } else {
      delete createScheduleDto.eachDayRepeat;
      delete createScheduleDto.finalRepeatDate;

      schedules.push(createScheduleDto);
    }

    return this.scheduleRepository.save(schedules);
  }
}
