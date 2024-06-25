import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { CreateInventoryItemDto } from '../dto/create-inventory-item.dto';

@Injectable()
export class CreateInventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryItemsRepository: Repository<InventoryItem>,
  ) {}

  execute(CreateInventoryItemDto: CreateInventoryItemDto) {
    try {
      const inventoryItem = this.inventoryItemsRepository.create(
        CreateInventoryItemDto,
      );

      return this.inventoryItemsRepository.save(inventoryItem);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
