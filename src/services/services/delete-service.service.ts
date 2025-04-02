import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from 'src/models/services.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteServiceService {  
  constructor(
    @InjectRepository(Services)
    private readonly serviceRepository: Repository<ServiceWorker>,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      await this.serviceRepository.softDelete(id);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error deleting service');
    }
  }
}
