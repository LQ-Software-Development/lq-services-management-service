import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../models/task.entity';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class CountActiveTasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) { }

    async execute(userId: string) {
        const today = new Date();
        const tasks = await this.taskRepository.find({
            where: [
                {
                    assignments: {
                        userId,
                    },
                    status: 'PENDING',
                    startDate: LessThanOrEqual(today),
                },
                {
                    assignments: {
                        userId,
                    },
                    status: 'IN_PROGRESS',
                    startDate: LessThanOrEqual(today),
                },
            ],
            relations: ['project'],
        });

        const totalTasks = tasks.length;

        const projectCounts = tasks.reduce((acc, task) => {
            const projectId = task.project.id;
            acc[projectId] = (acc[projectId] || 0) + 1;
            return acc;
        }, {});

        const projectPercentages = Object.keys(projectCounts).map(projectId => ({
            projectId,
            name: tasks.find(task => task.project.id === projectId).project.name,
            percentage: (projectCounts[projectId] / totalTasks) * 100,
        }));

        return {
            count: totalTasks,
            projects: projectPercentages,
        };

        /* return example:
        {
            count: 2,
            projects: [
                {
                    projectId: '1',
                    percentage: 50,
                },
                {
                    projectId: '2',
                    percentage: 50,
                },
            ],
        }
        */
    }
} 
