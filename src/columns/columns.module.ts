import { Module } from '@nestjs/common';
import { ColumnsController } from './columns.controller';
import { CreateStatusColumnService } from './services/create-status-column.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusColumn } from '../models/column.entity';
import { ListStatusColumnsService } from './services/list-status-columns.service';
import { UpdateStatusColumnService } from './services/update-status-column.service';
import { DeleteStatusColumnService } from './services/delete-status-column.service';

@Module({
  imports: [TypeOrmModule.forFeature([StatusColumn])],
  controllers: [ColumnsController],
  providers: [
    CreateStatusColumnService,
    ListStatusColumnsService,
    UpdateStatusColumnService,
    DeleteStatusColumnService,
  ],
})
export class ColumnsModule {}
