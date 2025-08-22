import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { SaleConfirmedDto } from '../dto/sale-confirmed.dto';
import { Task } from 'src/models/task.entity';
import { Services } from 'src/models/services.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateTasksFromSaleService {
    private readonly logger = new Logger(CreateTasksFromSaleService.name);
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async execute(saleDto: SaleConfirmedDto): Promise<string[]> {
        const createdIds: string[] = [];
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Busca último index apenas uma vez
            const lastTask = await queryRunner.manager.findOne(Task, {
                where: { organizationId: saleDto.organizationId },
                order: { index: 'DESC' },
            });
            let currentIndex = lastTask ? lastTask.index : 0;
            const tasksToSave: Task[] = [];

            // Data do pedido e batch fetch de serviços
            const orderDate = new Date(saleDto.date);
            // Extrai o ID do cliente do payload (se existir)
            const customerId = saleDto.customer?.id ?? saleDto.customer?.customerId;
            const serviceIds = saleDto.items
                .filter(item => item.type === 'service')
                .map(item => item.itemId);
            const serviceEntities = await queryRunner.manager.find(Services, {
                where: { id: In(serviceIds) },
            });
            const serviceMap = new Map(serviceEntities.map(s => [s.id, s]));

            for (const item of saleDto.items) {
                // Só processa serviços
                if (item.type !== 'service') {
                    this.logger.log(`Pulando item ${item.itemId}: não é serviço`);
                    continue;
                }
                // Define startDate: scheduledAt ou data do pedido
                const startDate =
                    item.metadata?.scheduledAt
                        ? new Date(item.metadata.scheduledAt)
                        : orderDate;
                // Obtém duração do serviço do map ou usa padrão de 60min se não encontrado
                const service = serviceMap.get(item.itemId);
                const durationMinutes = service?.timeExecution ?? 60;
                if (!service) {
                    this.logger.warn(
                        `Serviço não encontrado para item ${item.itemId}, usando duração padrão ${durationMinutes} minutos`,
                    );
                }
                // Calcula endDate
                const endDate = new Date(
                    startDate.getTime() + durationMinutes * 60000,
                );

                // Cria entidade
                const id = randomUUID();
                currentIndex++;
                const taskEntity = queryRunner.manager.create(Task, {
                    id,
                    title: item.itemName,
                    organizationId: saleDto.organizationId,
                    customerId,
                    index: currentIndex,
                    code: `${saleDto.id}-${currentIndex}`,
                    startDate,
                    endDate,
                    customerData: saleDto.customer,
                });
                tasksToSave.push(taskEntity);
                createdIds.push(id);
            }
            // Salva todas em lote
            if (tasksToSave.length > 0) {
                const insertValues = tasksToSave.map(task => ({
                    id: task.id,
                    title: task.title,
                    organizationId: task.organizationId,
                    customerId: task.customerId,
                    index: task.index,
                    code: task.code,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    customerData: task.customerData,
                }));
                await queryRunner.manager.insert(Task, insertValues);
            }
            await queryRunner.commitTransaction();
            return createdIds;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Erro na transação de criação de tasks', error);
            throw new InternalServerErrorException(
                'Falha ao criar tasks do evento sale.confirmed',
            );
        } finally {
            await queryRunner.release();
        }
    }
} 