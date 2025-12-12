import { IsDateString, IsNumber, IsString, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ReorderSchedulesDayDto {
  @ApiProperty({
    example: "2025-12-10",
    description: "Data no formato YYYY-MM-DD dos schedules a serem reordenados",
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "UUID do schedule que foi movido",
  })
  @IsString()
  movedItemId: string;

  @ApiProperty({
    example: 1,
    description:
      "Nova posição desejada (1 = primeira posição, 2 = segunda, etc.)",
  })
  @IsNumber()
  @Min(1)
  newPosition: number;
}
