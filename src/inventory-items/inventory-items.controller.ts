import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateInventoryItemsService } from './services/create-inventory-items.service';
import { ListInventoryItemsService } from './services/list-inventory-items.service';
import { UpdateInventoryItemService } from './services/update-inventory-item.service';
import { FindOneInventoryItemService } from './services/find-one-inventory-item.service';
import { DeleteInventoryItemService } from './services/delete-inventory-item.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('inventory-items')
export class InventoryItemsController {
  constructor(
    private readonly createInventoryItemsService: CreateInventoryItemsService,
    private readonly listInventoryItemsService: ListInventoryItemsService,
    private readonly updateInventoryItemService: UpdateInventoryItemService,
    private readonly findOneInventoryItemService: FindOneInventoryItemService,
    private readonly deleteInventoryItemService: DeleteInventoryItemService,
  ) {}

  @Post()
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.createInventoryItemsService.execute(createInventoryItemDto);
  }

  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  findAll(@Query() query: { page?: number; limit?: number }) {
    return this.listInventoryItemsService.execute(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.findOneInventoryItemService.execute(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
  ) {
    return this.updateInventoryItemService.execute(id, updateInventoryItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteInventoryItemService.execute(id);
  }
}
