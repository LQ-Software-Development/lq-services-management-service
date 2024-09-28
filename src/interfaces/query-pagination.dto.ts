import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryPaginationDto {
  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  externalId?: string;
}
