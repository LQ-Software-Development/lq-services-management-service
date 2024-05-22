import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { CreateStatusColumnService } from './services/create-status-column.service';
import { ListStatusColumnsService } from './services/list-status-columns.service';
import { UpdateStatusColumnService } from './services/update-status-column.service';
import { DeleteStatusColumnService } from './services/delete-status-column.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Status Columns')
@Controller('status-columns')
export class ColumnsController {
  constructor(
    private readonly createStatusColumnService: CreateStatusColumnService,
    private readonly listStatusColumnsService: ListStatusColumnsService,
    private readonly updateStatusColumnService: UpdateStatusColumnService,
    private readonly deleteStatusColumnService: DeleteStatusColumnService,
  ) {}

  @Post()
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.createStatusColumnService.execute(createColumnDto);
  }

  @Get()
  findAll() {
    return this.listStatusColumnsService.execute();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateColumnDto: UpdateColumnDto) {
    return this.updateStatusColumnService.execute(updateColumnDto, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteStatusColumnService.execute(id);
  }
}
