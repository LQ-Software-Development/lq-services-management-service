import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../models/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class CreateProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async execute(createProjectDto: CreateProjectDto) {
        try {
            const project = this.projectRepository.create(createProjectDto);
            return await this.projectRepository.save(project);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error creating project');
        }
    }
} 