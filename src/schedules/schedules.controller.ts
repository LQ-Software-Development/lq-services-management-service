import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
// import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateSchedulesService } from './service/create-schedules.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListSchedulesService } from './service/list-schedules.service';
import { ListSchedulesServiceDto } from './dto/list-schedules.dto';
import { DeleteSchedulesService } from './service/delete-schedules.service';
import { FetchScheduleService } from './service/fetch-schedule.service';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly createSchedulesService: CreateSchedulesService,
    private readonly listSchedulesService: ListSchedulesService,
    private readonly deleteSchedulesService: DeleteSchedulesService,
    private readonly fetchScheduleService: FetchScheduleService,
  ) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.createSchedulesService.execute(createScheduleDto);
  }

  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'organizationId', required: false })
  @Get()
  findAll(@Query() query: ListSchedulesServiceDto) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    }

    return this.listSchedulesService.execute({
      startDate,
      endDate,
      organizationId: query.organizationId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fetchScheduleService.execute({ id });
  }

  /*
    
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
      return this.schedulesService.update(+id, updateScheduleDto);
    }
  */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteSchedulesService.execute(id);
  }
}
