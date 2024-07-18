import { ApiQuery } from "@nestjs/swagger";
import { IsString, IsOptional, IsDateString } from "class-validator";

export class ListSchedulesServiceDto {
    @IsOptional()
    @IsString()
    organizationId: string;

    @IsOptional()
    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate: string;
}