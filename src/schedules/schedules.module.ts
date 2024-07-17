import { Module } from '@nestjs/common';
import { CreateSchedulesService } from './service/create-schedules.service';
import { SchedulesController } from './schedules.controller';
import { Schedule } from 'src/models/schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule])],
  controllers: [SchedulesController],
  providers: [CreateSchedulesService],
})
export class SchedulesModule { }
