import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskTimeLog } from '../../../models/task-timing-log.entity';
import { Task } from '../../../models/task.entity';
import { CreateTimeLogDto } from '../../../time-logs/dto/create-time-log.dto';

@Injectable()
export class CreateTimeLogService {
    constructor(
        @InjectRepository(TaskTimeLog)
        private readonly timeLogRepository: Repository<TaskTimeLog>,
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async execute(
        createTimeLogDto: CreateTimeLogDto,
        organizationId: string,
        userId: string,
    ) {
        let task: Task = null;

        if (createTimeLogDto.taskId) {
            task = await this.taskRepository.findOne({
                where: { id: createTimeLogDto.taskId },
                relations: ['project']
            });

            if (!task || task.project.organizationId !== organizationId) {
                throw new NotFoundException('Task not found in this organization');
            }
        }

        const timeLog = this.timeLogRepository.create({
            ...createTimeLogDto,
            organizationId,
            userId,
            task,
            totalMinutes: this.calculateTotalMinutes(
                createTimeLogDto.startTime,
                createTimeLogDto.endTime
            )
        });

        return this.timeLogRepository.save(timeLog);
    }

    private calculateTotalMinutes(start: Date, end?: Date): number {
        return end ? Math.floor((end.getTime() - start.getTime()) / 60000) : 0;
    }
} 