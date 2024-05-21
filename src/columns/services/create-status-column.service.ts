import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreateColumnDto } from "../dto/create-column.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { StatusColumn } from "../../models/column.entity";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

@Injectable()
export class CreateStatusColumnService {
  constructor(
    @InjectRepository(StatusColumn)
    private readonly statusColumnRepository: Repository<StatusColumn>
  ) { }

  async execute(createColumnDto: CreateColumnDto) {
    const id = uuid();

    try {
      const statusColumn = this.statusColumnRepository.create({
        ...createColumnDto,
        id,
      });

      this.statusColumnRepository.save(statusColumn);

      return { id };
    } catch (error) {
      throw new InternalServerErrorException('Error creating status column');
    }
  }
}