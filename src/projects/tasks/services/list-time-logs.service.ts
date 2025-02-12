import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTimeLog } from '../../../models/task-timing-log.entity';

@Injectable()
export class ListTimeLogsService {
    constructor(
        @InjectRepository(TaskTimeLog)
        private readonly timeLogRepository: Repository<TaskTimeLog>,
    ) { }

    async execute(organizationId: string) {
        return this.timeLogRepository.find({
            where: { organizationId },
            relations: ['task'],
            order: { startTime: 'DESC' }
        });
    }
} 
