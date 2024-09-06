import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumberString,
} from 'class-validator';

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

  @IsOptional()
  @IsNumberString()
  page: string | number;

  @IsOptional()
  @IsNumberString()
  limit: string | number;
}
