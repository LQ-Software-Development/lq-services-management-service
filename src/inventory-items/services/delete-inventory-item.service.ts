import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';

@Injectable()
export class DeleteInventoryItemService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,
  ) {}

  execute(id: string) {
    return this.inventoryItemsRepository.softDelete(id);
  }
}
