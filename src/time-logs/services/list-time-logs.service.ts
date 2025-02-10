import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTimeLog } from '../../models/task-timing-log.entity';

@Injectable()
export class ListTimeLogsService {
    constructor(
        @InjectRepository(TaskTimeLog)
        private readonly timeLogRepository: Repository<TaskTimeLog>,
    ) { }

    async execute(organizationId: string) {
        return this.timeLogRepository.find({
            where: { organizationId },
            relations: ['task', 'task.project'],
            order: { startTime: 'DESC' },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                totalMinutes: true,
                description: true,
                userId: true,
                task: {
                    id: true,
                    title: true,
                    code: true,
                    project: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }
} 