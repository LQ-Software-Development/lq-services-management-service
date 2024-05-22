import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusColumn } from 'src/models/column.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteStatusColumnService {
  constructor(
    @InjectRepository(StatusColumn)
    private readonly statusColumnRepository: Repository<StatusColumn>,
  ) {}

  execute(id: string) {
    try {
      this.statusColumnRepository.softDelete(id);

      return { message: 'Column deleted successfully', id };
    } catch (error) {
      throw new InternalServerErrorException('Error deleting status column');
    }
  }
}
