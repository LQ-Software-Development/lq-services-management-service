import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserDto } from './user-dto';
import { ClientDto } from './client.dto';
import { randomUUID } from 'crypto';
import { InventoryItemDto } from './inventory-item.dto';

export class CreateTaskDto {
  @ApiProperty({
    example: 'OS001',
  })
  code: string;

  @ApiPropertyOptional({
    type: ClientDto,
  })
  client?: ClientDto;

  @ApiPropertyOptional({
    example: 100,
  })
  value?: number;

  @ApiPropertyOptional({
    type: [UserDto],
  })
  assignedTo?: UserDto[];

  @ApiPropertyOptional({
    example: 'Essa é uma observação sobre a tarefa.',
  })
  description?: string;

  @ApiProperty({
    example: randomUUID(),
  })
  stockId: string;

  @ApiPropertyOptional({
    type: InventoryItemDto,
  })
  item?: InventoryItemDto;

  @ApiPropertyOptional({
    example: 'Avendia Paulista, 1000 - São Paulo - SP',
  })
  address?: string;

  @ApiProperty({
    example: new Date().toString(),
  })
  deadline: Date;

  @ApiProperty({
    example: randomUUID(),
  })
  statusId: string;

  @ApiProperty({
    example: randomUUID(),
  })
  parentTaskId?: string;

  @ApiPropertyOptional({
    type: [CreateTaskDto],
    example: [],
  })
  subTasks?: CreateTaskDto[];
}
