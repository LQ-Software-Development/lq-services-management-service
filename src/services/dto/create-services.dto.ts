import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateServicesDto {
  @ApiProperty({
    example: 'Service name',
    type: String,
    description: 'Service name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'This is a description',
    type: String,
    description: 'Service description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    type: String,
    description: 'Cover image URL',
  })
  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @ApiProperty({
    example: new Date(),
    type: Date,
    description: 'Date and time of service execution',
  })
  @IsDateString()
  timeExecution: Date;

  @ApiProperty({
    example: 100,
    type: Number,
    description: 'Service price',
  })
  @IsNumber()
  servicePrice: number;
}
