import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';

@Injectable()
export class FindOneInventoryItemService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
  ) {}

  execute(id: string) {
    return this.inventoryItemRepository.findOne({
      where: {
        id,
      },
    });
  }
}
