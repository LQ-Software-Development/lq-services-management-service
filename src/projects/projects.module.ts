import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../models/project.entity';
import { ProjectsController } from './projects.controller';
import { CreateProjectService } from './services/create-project.service';
import { GetProjectsService } from './services/get-projects.service';
import { GetProjectService } from './services/get-project.service';
import { UpdateProjectService } from './services/update-project.service';
import { DeleteProjectService } from './services/delete-project.service';

@Module({
    imports: [TypeOrmModule.forFeature([Project])],
    controllers: [ProjectsController],
    providers: [
        CreateProjectService,
        GetProjectsService,
        GetProjectService,
        UpdateProjectService,
        DeleteProjectService,
    ],
})
export class ProjectsModule { } 