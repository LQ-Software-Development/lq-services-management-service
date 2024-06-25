import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { Services } from './models/services.entity';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { ColumnsModule } from './columns/columns.module';
import { StatusColumn } from './models/column.entity';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './models/task.entity';
import { BoardsModule } from './boards/boards.module';
import { Board } from './models/board.entity';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { InventoryItem } from './inventory-items/entities/inventory-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Services, StatusColumn, Task, Board, InventoryItem],
      synchronize: true,
    }),
    ServicesModule,
    ColumnsModule,
    TasksModule,
    BoardsModule,
    InventoryItemsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
