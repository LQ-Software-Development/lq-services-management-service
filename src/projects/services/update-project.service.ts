import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../models/project.entity';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Injectable()
export class UpdateProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async execute(updateProjectDto: UpdateProjectDto, id: string) {
        const project = await this.projectRepository.findOne({ where: { id } });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        await this.projectRepository.update(id, updateProjectDto);
        return { message: 'Project updated successfully', id };
    }
} 