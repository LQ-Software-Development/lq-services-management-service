import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../../../models/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ApprovalCriterion } from 'src/models/approval-criterion.entity';
import { Project } from 'src/models/project.entity';

@Injectable()
export class CreateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(ApprovalCriterion)
    private readonly approvalCriterionRepository: Repository<ApprovalCriterion>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async execute(createTaskDto: CreateTaskDto, projectId: string) {
    const id = randomUUID();
    let approvalCriteria: ApprovalCriterion[] = [];

    try {
      const project = await this.projectRepository.findOne({ where: { id: projectId } });

      console.log(project);

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const lastIndex = await this.taskRepository.findOne({ where: { project: { id: projectId } }, order: { index: 'DESC' }, relations: ['project'] });

      const index = lastIndex ? lastIndex.index + 1 : 1;

      if (createTaskDto.approvalCriteria) {
        approvalCriteria = await Promise.all(
          createTaskDto.approvalCriteria.map(async (criterion) => {
            const newCriterion = this.approvalCriterionRepository.create(criterion);
            return await this.approvalCriterionRepository.save(newCriterion);
          })
        );
      }

      const createTask = this.taskRepository.create({
        ...createTaskDto,
        id,
        project,
        approvalCriteria,
        index,
        code: `${project.code}-${index}`,
      });

      await this.taskRepository.save(createTask);

      return { id };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error creating task');
    }
  }
}
