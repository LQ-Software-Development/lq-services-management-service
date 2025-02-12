import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../models/project.entity';

@Injectable()
export class GetProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async execute(organizationId: string) {
        return await this.projectRepository.find({
            where: { organizationId },
            relations: ['tasks']
        });
    }
}