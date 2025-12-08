import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ReorderItemDto {
  @ApiProperty({ example: "uuid-da-os-movida" })
  @IsString()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  newIndex: number;
}

export class ReorderSchedulesDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
