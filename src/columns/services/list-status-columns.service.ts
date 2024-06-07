import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusColumn } from '../../models/column.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ListStatusColumnsService {
  constructor(
    @InjectRepository(StatusColumn)
    private readonly statusColumnRepository: Repository<StatusColumn>,
  ) {}

  async execute() {
    return this.statusColumnRepository.find({
      relations: ['tasks', 'tasks.inventoryItems'],

      withDeleted: false,
    });
  }
}
