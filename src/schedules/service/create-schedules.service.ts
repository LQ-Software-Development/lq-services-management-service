import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { Schedule } from 'src/models/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

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
      const date = new Date(createScheduleDto.date);

      while (date <= finalRepeatDate) {
        schedules.push({
          ...createScheduleDto,
          date: date.toISOString(),
        });

        date.setDate(date.getDate() + createScheduleDto.eachDayRepeat);
      }
    } else {
      delete createScheduleDto.eachDayRepeat;
      delete createScheduleDto.finalRepeatDate;

      schedules.push(createScheduleDto);
    }

    return this.scheduleRepository.save(createScheduleDto);
  }
}
