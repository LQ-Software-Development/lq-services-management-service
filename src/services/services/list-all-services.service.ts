import { Injectable } from '@nestjs/common';

import { Services } from '../../models/services.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ListAllServicesService {
  constructor(
    @InjectRepository(Services)
    private servicesRepository: Repository<Services>,
  ) {}

  async execute() {
    const [all] = await this.servicesRepository.findAndCount({
      withDeleted: false,
      order: { index: 'ASC' },
    });

    return {
      services: all.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.servicePrice,
        status: item.status,
        index: item.index,
      })),
    };
  }
}
