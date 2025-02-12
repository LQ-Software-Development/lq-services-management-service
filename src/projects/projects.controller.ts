import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateProjectService } from './services/create-project.service';
import { GetProjectsService } from './services/get-projects.service';
import { GetProjectService } from './services/get-project.service';
import { UpdateProjectService } from './services/update-project.service';
import { DeleteProjectService } from './services/delete-project.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
    constructor(
        private readonly createProjectService: CreateProjectService,
        private readonly getProjectsService: GetProjectsService,
        private readonly getProjectService: GetProjectService,
        private readonly updateProjectService: UpdateProjectService,
        private readonly deleteProjectService: DeleteProjectService,
    ) { }

    @Post()
    create(@Body() createProjectDto: CreateProjectDto, @Headers('organization-id') organizationId: string) {
        return this.createProjectService.execute({
            ...createProjectDto,
            organizationId,
        });
    }

    @Get()
    getProjects(@Headers('organization-id') organizationId: string) {
        return this.getProjectsService.execute(
            organizationId,
        );
    }

    @Get(':id')
    getProject(@Param('id') id: string) {
        return this.getProjectService.execute(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
        return this.updateProjectService.execute(updateProjectDto, id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.deleteProjectService.execute(id);
    }
} 