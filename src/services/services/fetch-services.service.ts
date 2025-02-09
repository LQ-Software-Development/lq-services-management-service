import { Injectable } from '@nestjs/common';

import { Services } from '../../models/services.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { QueryPaginationDto } from '../../interfaces/query-pagination.dto';

@Injectable()
export class FetchServicesService {
  constructor(
    @InjectRepository(Services)
    private servicesRepository: Repository<Services>,
  ) { }

  async execute(queryPaginationDto: QueryPaginationDto) {
    const { page = 1, limit = 10, search, externalId } = queryPaginationDto;

    const [services, count] = await this.servicesRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
        externalId,
      },
      withDeleted: false,
      order: { index: 'DESC' },
    });

    return {
      services,
      totalServices: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }
}
