import { Module } from '@nestjs/common';
import { InventoryItemsController } from './inventory-items.controller';
import { CreateInventoryItemsService } from './services/create-inventory-items.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListInventoryItemsService } from './services/list-inventory-items.service';
import { UpdateInventoryItemService } from './services/update-inventory-item.service';
import { FindOneInventoryItemService } from './services/find-one-inventory-item.service';
import { DeleteInventoryItemService } from './services/delete-inventory-item.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem])],
  controllers: [InventoryItemsController],
  providers: [
    CreateInventoryItemsService,
    ListInventoryItemsService,
    UpdateInventoryItemService,
    FindOneInventoryItemService,
    DeleteInventoryItemService,
  ],
})
export class InventoryItemsModule {}
