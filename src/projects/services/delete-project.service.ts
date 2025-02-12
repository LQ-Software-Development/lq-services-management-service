import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../models/project.entity';

@Injectable()
export class DeleteProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async execute(id: string) {
        try {
            await this.projectRepository.softDelete(id);
            return { message: 'Project deleted successfully' };
        } catch (error) {
            throw new InternalServerErrorException('Error deleting project');
        }
    }
} 