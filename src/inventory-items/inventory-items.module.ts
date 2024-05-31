import { Module } from '@nestjs/common';
import { InventoryItemsController } from './inventory-items.controller';

@Module({
  controllers: [InventoryItemsController],
})
export class InventoryItemsModule {}
