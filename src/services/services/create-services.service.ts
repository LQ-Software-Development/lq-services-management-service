import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { InternalServerErrorException } from '@nestjs/common';
import { Services } from '../../models/services.entity';
import { CreateServicesDto } from '../dto/create-services.dto';

export class CreateServicesService {
  constructor(
    @InjectRepository(Services)
    private readonly servicesRepository: Repository<Services>,
  ) { }

  async execute(createServicesDto: CreateServicesDto, externalId?: string) {
    const id = randomUUID();

    if (process.env.SAAS_MODE === 'true' && !externalId) {
      throw new InternalServerErrorException(
        'External ID is required in SAAS mode',
      );
    }

    try {
      const query = this.servicesRepository.create({
        id,
        externalId,
        ...createServicesDto,
        index: (await this.servicesRepository.count()) + 1,
      });

      await this.servicesRepository.save(query);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error creating purchase');
    }

    return { id };
  }
}
