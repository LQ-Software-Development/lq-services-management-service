import { Module } from '@nestjs/common';
import { CreateSchedulesService } from './service/create-schedules.service';
import { SchedulesController } from './schedules.controller';
import { Schedule } from 'src/models/schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListSchedulesService } from './service/list-schedules.service';
import { DeleteSchedulesService } from './service/delete-schedules.service';
import { FetchScheduleService } from './service/fetch-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  controllers: [SchedulesController],
  providers: [
    CreateSchedulesService,
    ListSchedulesService,
    DeleteSchedulesService,
    FetchScheduleService,
  ],
})
export class SchedulesModule {}
