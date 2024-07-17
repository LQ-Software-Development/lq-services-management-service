import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateSchedulesService } from './service/create-schedules.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly createSchedulesService: CreateSchedulesService) { }

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.createSchedulesService.execute(createScheduleDto);
  }
/*
  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
  */
}
