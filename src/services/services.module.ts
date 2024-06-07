import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from '../models/services.entity';
import { FetchServicesService } from './services/fetch-services.service';
import { CreateServicesService } from './services/create-services.service';
import { ListAllServicesService } from './services/list-all-services.service';
import { DeleteServiceService } from './services/delete-service.service';

@Module({
  imports: [TypeOrmModule.forFeature([Services])],
  controllers: [ServicesController],
  providers: [
    FetchServicesService,
    CreateServicesService,
    ListAllServicesService,
    DeleteServiceService,
  ],
})
export class ServicesModule {}
