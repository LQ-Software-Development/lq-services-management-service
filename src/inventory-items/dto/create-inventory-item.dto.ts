import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  model: string;

  @ApiPropertyOptional()
  modelId: string;

  @ApiPropertyOptional()
  code: string;

  @ApiPropertyOptional()
  serialNumber: string;

  @ApiPropertyOptional()
  brandName: string;

  @ApiPropertyOptional()
  brandId: string;

  @ApiPropertyOptional()
  contractEnds: Date;

  @ApiPropertyOptional()
  observation: string;
}
