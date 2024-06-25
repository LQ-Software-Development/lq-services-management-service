import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateInventoryItemDto } from '../dto/update-inventory-item.dto';

@Injectable()
export class UpdateInventoryItemService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  execute(id: string, updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryRepository.update(id, updateInventoryItemDto);
  }
}
