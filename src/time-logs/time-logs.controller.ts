import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UseInterceptors,
} from "@nestjs/common";
import { CreateTimeLogDto } from "./dto/create-time-log.dto";
import { CreateTimeLogService } from "./services/create-time-log.service";
import { ListTimeLogsService } from "./services/list-time-logs.service";
import { OrganizationIdInterceptor } from "../interceptors/organization-id.interceptor";

@Controller("time-logs")
@UseInterceptors(OrganizationIdInterceptor)
export class TimeLogsController {
  constructor(
    private readonly createTimeLogService: CreateTimeLogService,
    private readonly listTimeLogsService: ListTimeLogsService,
  ) {}

  @Post()
  create(
    @Body() createTimeLogDto: CreateTimeLogDto,
    @Headers("user-id") userId: string,
    @Headers("organization-id") organizationId: string,
  ) {
    return this.createTimeLogService.execute(
      createTimeLogDto,
      organizationId,
      userId,
    );
  }

  @Get()
  list(@Headers("organization-id") organizationId: string) {
    return this.listTimeLogsService.execute(organizationId);
  }
}
