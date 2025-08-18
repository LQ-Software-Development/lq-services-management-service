import {
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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
  assignedId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: new Date(),
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

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  eachDayRepeat?: number;

  @ApiPropertyOptional({
    enum: ["day", "week", "month", "bi-weekly", "year"],
    default: "day",
    description:
      "Type of interval for repetition. Defaults to 'day'. Supported: 'day', 'week', 'month', 'bi-weekly', 'year', etc.",
  })
  @IsString()
  @IsOptional()
  intervalType: string = "day";
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  finalRepeatDate?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: {
      key: "value",
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
