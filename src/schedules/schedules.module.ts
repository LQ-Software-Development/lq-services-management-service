import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulesController } from './schedules.controller';
import { CreateSchedulesService } from './services/create-schedules.service';
import { ListSchedulesService } from './services/list-schedules.service';
import { DeleteSchedulesService } from './services/delete-schedules.service';
import { FetchScheduleService } from './services/fetch-schedule.service';
import { UpdateScheduleService } from './services/update-schedule.service';
import { DeleteClientSchedulesService } from './services/delete-client-schedules.service';
import { FinancialApiProvider } from 'src/providers/financial-api.provider';
import { Schedule } from 'src/models/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  controllers: [SchedulesController],
  providers: [
    CreateSchedulesService,
    ListSchedulesService,
    DeleteSchedulesService,
    FetchScheduleService,
    UpdateScheduleService,
    FinancialApiProvider,
    DeleteClientSchedulesService,
  ],
})
export class SchedulesModule {}
