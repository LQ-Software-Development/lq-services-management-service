import { Controller, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskService } from './services/create-task.service';
import { UpdateTaskService } from './services/update-task.service';
import { DeleteTaskService } from './services/delete-task.service';
import { ApiTags } from '@nestjs/swagger';
import { AddLogDto } from './dto/add-log.dto';
import { AddTaskLogService } from './services/add-task-log.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskService: CreateTaskService,
    private readonly updateTaskService: UpdateTaskService,
    private readonly deleteTaskService: DeleteTaskService,
    private readonly addLogService: AddTaskLogService,
  ) { }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.createTaskService.execute(createTaskDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.updateTaskService.execute(updateTaskDto, id);
  }

  @Patch(':id')
  addLog(@Param('id') id: string, @Body() addLogDto: AddLogDto) {
    return this.addLogService.execute(id, addLogDto.log, addLogDto.type);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteTaskService.execute(id);
  }
}
