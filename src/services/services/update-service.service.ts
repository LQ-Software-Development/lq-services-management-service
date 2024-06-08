import { InjectRepository } from '@nestjs/typeorm';
import { Services } from 'src/models/services.entity';
import { Repository } from 'typeorm';
import { UpdateServicesDto } from '../dto/update-services.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateServiceService {
  constructor(
    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
  ) {}

  async execute(id: string, data: UpdateServicesDto) {
    const service = await this.serviceRepository.findOneBy({ id });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    Object.assign(service, data);

    return this.serviceRepository.save(service);
  }
}
