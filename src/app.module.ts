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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Services, StatusColumn, Task],
      synchronize: true,
    }),
    ServicesModule,
    ColumnsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
