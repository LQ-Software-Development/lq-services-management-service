import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/models/task.entity';
import { RabbitmqConsumerService } from './services/rabbitmq-consumer.service';
import { CreateTasksFromSaleService } from './services/create-tasks-from-sale.service';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Task]),
    ],
    providers: [RabbitmqConsumerService, CreateTasksFromSaleService],
    exports: [],
})
export class RabbitmqModule { } 