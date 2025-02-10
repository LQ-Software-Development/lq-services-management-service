import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateProjectDto {
    @ApiPropertyOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    status?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    priority?: string;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    price?: number;

    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    deadline?: Date;

    organizationId: string;
} 