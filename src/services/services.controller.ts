import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateServicesService } from './services/create-services.service';
import { FetchServicesService } from './services/fetch-services.service';
import { CreateServicesDto } from './dto/create-services.dto';
import { QueryPaginationDto } from '../interfaces/query-pagination.dto';
import { ListAllServicesService } from './services/list-all-services.service';
import { DeleteServiceService } from './services/delete-service.service';
import { UpdateServicesDto } from './dto/update-services.dto';
import { UpdateServiceService } from './services/update-service.service';

@ApiTags('Serviços')
@Controller('services')
export class ServicesController {
  constructor(
    private createServicesService: CreateServicesService,
    private fetchServicesService: FetchServicesService,
    private listAllServicesService: ListAllServicesService,
    private deleteServiceService: DeleteServiceService,
    private updateServiceService: UpdateServiceService,
  ) {}

  @Post()
  create(@Body() createServicesDto: CreateServicesDto) {
    return this.createServicesService.execute(createServicesDto);
  }

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  async findAll(@Query() queryPaginationDto: QueryPaginationDto) {
    const result = await this.fetchServicesService.execute(queryPaginationDto);
    return result;
  }

  @Get('selection-list')
  async listAll() {
    const result = await this.listAllServicesService.execute();
    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteServiceService.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateServicesDto) {
    return this.updateServiceService.execute(id, data);
  }
}
