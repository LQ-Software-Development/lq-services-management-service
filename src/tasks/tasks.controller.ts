import { Body, Controller, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { ListTasksService } from './services/list-tasks.service';
import { GetTaskService } from './services/get-task.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { EditTaskService } from './services/edit-task.service';
import { UpdateTaskDto } from 'src/projects/tasks/dto/update-task.dto';
import { CountActiveTasksService } from './services/count-active-tasks.service';
import { ListTasksFilterDto } from './dto/list-tasks-filter.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly listTasksService: ListTasksService,
    private readonly getTaskService: GetTaskService,
    private readonly editTaskServiec: EditTaskService,
    private readonly countActiveTasksService: CountActiveTasksService,
  ) { }

  @Get()
  @ApiQuery({ type: ListTasksFilterDto })
  async list(
    @Headers('organization-id') organizationId: string,
    @Query() filters: ListTasksFilterDto
  ) {
    return this.listTasksService.execute(filters, organizationId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.getTaskService.execute(id);
  }

  @Patch(':id')
  async update(@Body() updateTaskDto: UpdateTaskDto) {
    return this.editTaskServiec.execute(updateTaskDto);
  }

  @Get('active/count')
  async countActiveTasks(@Headers('user-id') userId: string) {
    return this.countActiveTasksService.execute(userId);
  }
}
