import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumberString,
  IsEnum,
} from "class-validator";

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

  @IsOptional()
  @IsEnum(["description", "date"])
  sort: "description" | "date";

  @IsOptional()
  @IsEnum(["asc", "desc"])
  order: "asc" | "desc";

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  searchYacht: string;

  @IsOptional()
  @IsString()
  status: string;
}
