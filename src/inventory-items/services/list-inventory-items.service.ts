import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ListInventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemsRepository: Repository<InventoryItem>,
  ) {}

  async execute(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 5 } = query;

    const [data, count] = await this.inventoryItemsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      withDeleted: false,
    });

    return {
      data,
      count,
    };
  }
}
