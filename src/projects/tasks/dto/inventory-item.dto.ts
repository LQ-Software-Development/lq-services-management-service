import { ApiProperty } from '@nestjs/swagger';

export class InventoryItemDto {
  @ApiProperty({
    example: '123',
  })
  id: string;

  @ApiProperty({
    example: '123',
  })
  serialNumber: string;

  @ApiProperty({
    example: '123',
  })
  name: string;
}
