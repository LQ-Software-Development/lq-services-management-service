import { Injectable } from '@nestjs/common';

import { Services } from '../../../src/models/services.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { QueryPaginationDto } from 'src/interfaces/query-pagination.dto';

@Injectable()
export class FetchServicesService {
  constructor(
    @InjectRepository(Services)
    private servicesRepository: Repository<Services>,
  ) {}

  async execute(queryPaginationDto: QueryPaginationDto) {
    const { page = 1, limit = 10, search } = queryPaginationDto;

    const [services, count] = await this.servicesRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: {
        name: search ? ILike(`%${search}%`) : undefined,
      },
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
