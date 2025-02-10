import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTimeLogDto {
    @ApiProperty({ example: '2024-03-20T09:00:00Z' })
    @IsDateString()
    startTime: Date;

    @ApiPropertyOptional({ example: '2024-03-20T12:00:00Z' })
    @IsDateString()
    @IsOptional()
    endTime?: Date;

    @ApiPropertyOptional({ example: 'Desenvolvimento da feature X' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: 'uuid-da-tarefa' })
    @IsUUID()
    @IsOptional()
    taskId?: string;
} 