import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateServicesService } from './services/create-services.service';
import { FetchServicesService } from './services/fetch-services.service';
import { CreateServicesDto } from './dto/create-services.dto';
import { QueryPaginationDto } from '../interfaces/query-pagination.dto';
import { ListAllServicesService } from './services/list-all-services.service';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(
    private createServicesService: CreateServicesService,
    private fetchServicesService: FetchServicesService,
    private listAllServicesService: ListAllServicesService,
  ) { }

  @Post()
  create(@Body() createServicesDto: CreateServicesDto) {
    return this.createServicesService.execute(createServicesDto);
  }

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  // @ApiQuery({ name: 'status', required: false })
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
}
