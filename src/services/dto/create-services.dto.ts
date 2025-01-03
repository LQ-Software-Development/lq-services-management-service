import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateServicesDto {
  @ApiProperty({
    example: 'Service name',
    type: String,
    description: 'Service name',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'This is a description',
    type: String,
    description: 'Service description',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    type: String,
    description: 'Cover image URL',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({
    example: 60,
    description: 'time of service execution',
  })
  @IsOptional()
  @IsNumber()
  timeExecution: number;

  @ApiPropertyOptional()
  externalId: string;

  @IsNumber()
  @ApiProperty({
    example: 100,
    type: Number,
    description: 'Service price',
  })
  @IsNumber()
  servicePrice: number;

  @ApiPropertyOptional({
    example: {
      key: 'value',
    },
    type: Object,
    description: 'Service metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
