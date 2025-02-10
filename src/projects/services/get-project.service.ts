import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../models/project.entity';

@Injectable()
export class GetProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async execute(id: string) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['tasks'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }
} 