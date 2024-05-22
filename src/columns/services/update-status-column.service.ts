import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusColumn } from '../../models/column.entity';
import { Repository } from 'typeorm';
import { UpdateColumnDto } from '../dto/update-column.dto';

@Injectable()
export class UpdateStatusColumnService {
  constructor(
    @InjectRepository(StatusColumn)
    private readonly statusColumnRepository: Repository<StatusColumn>,
  ) {}

  execute(updateColumnDto: UpdateColumnDto, id: string) {
    try {
      this.statusColumnRepository.update(id, updateColumnDto);

      return { message: 'Column updated successfully', id };
    } catch (error) {
      throw new InternalServerErrorException('Error editing status column');
    }
  }
}
