import { Injectable, OnApplicationBootstrap, OnApplicationShutdown, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel, Message } from 'amqplib';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import {
    RABBITMQ_EXCHANGE_NAME,
    SALE_CONFIRMED_ROUTING_KEY,
    CREATE_TASKS_SCHEDULES_QUEUE,
} from '../rabbitmq.constants';
import { CreateTasksFromSaleService } from './create-tasks-from-sale.service';
import { SaleConfirmedDto } from '../dto/sale-confirmed.dto';

@Injectable()
export class RabbitmqConsumerService implements OnApplicationBootstrap, OnApplicationShutdown {
    private connection: Connection;
    private channel: Channel;
    private readonly logger = new Logger(RabbitmqConsumerService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly createTasksService: CreateTasksFromSaleService,
    ) { }

    async onApplicationBootstrap() {
        const url = this.configService.get<string>('RABBITMQ_URL');
        const prefetch = Number(this.configService.get<number>('RABBITMQ_PREFETCH') || 1);

        try {
            this.connection = await connect(url);
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error', err);
                setTimeout(() => this.reconnect(), 5000);
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed, reconnecting...');
                setTimeout(() => this.reconnect(), 5000);
            });

            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(RABBITMQ_EXCHANGE_NAME, 'topic', { durable: true });
            await this.channel.assertQueue(CREATE_TASKS_SCHEDULES_QUEUE, { durable: true });
            await this.channel.bindQueue(
                CREATE_TASKS_SCHEDULES_QUEUE,
                RABBITMQ_EXCHANGE_NAME,
                SALE_CONFIRMED_ROUTING_KEY,
            );
            await this.channel.prefetch(prefetch);

            await this.channel.consume(
                CREATE_TASKS_SCHEDULES_QUEUE,
                async (msg: Message | null) => {
                    if (!msg) return;
                    try {
                        const content = msg.content.toString();
                        const payload = JSON.parse(content);
                        const saleDto = plainToInstance(SaleConfirmedDto, payload);
                        await validateOrReject(saleDto, { whitelist: true });

                        if (!saleDto.organizationId) {
                            this.logger.error(
                                `Payload sem contexto (saleId=${saleDto.id}), rejeitando mensagem`,
                            );
                            this.channel.nack(msg, false, false);
                            return;
                        }

                        await this.createTasksService.execute(saleDto);
                        this.channel.ack(msg);
                    } catch (err) {
                        this.logger.error('Erro ao processar event sale.confirmed', err);
                        this.channel.nack(msg, false, false);
                    }
                },
            );

            this.logger.log('RabbitMQ consumer iniciado e aguardando mensagens');
        } catch (err) {
            this.logger.error('Erro ao conectar ao RabbitMQ', err);
            setTimeout(() => this.reconnect(), 5000);
        }
    }

    private async reconnect() {
        try {
            await this.onApplicationBootstrap();
        } catch (err) {
            this.logger.error('Falha na tentativa de reconexão ao RabbitMQ', err);
        }
    }

    async onApplicationShutdown(signal: string) {
        this.logger.log('Fechando conexão e canal RabbitMQ');
        await this.channel?.close();
        await this.connection?.close();
    }
} 