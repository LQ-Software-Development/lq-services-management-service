import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateScheduleDto {

    @ApiProperty()
    @IsString()
    @IsOptional()
    clientId?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    clientName?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: new Date()
    })
    @IsDateString()
    date: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    groupId?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    organizationId?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    serviceId?: string;
}
