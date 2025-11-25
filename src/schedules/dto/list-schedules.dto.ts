import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumberString,
  IsEnum,
  IsArray,
} from "class-validator";
import { Transform } from "class-transformer";

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

  @Transform(({ value }) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string | string[];
}
