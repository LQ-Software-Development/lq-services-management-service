import { ApiProperty } from '@nestjs/swagger';
import { InventoryItem } from 'src/inventory-items/entities/inventory-item.entity';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Create a new task',
  })
  resume: string;
  @ApiProperty({
    example: 'TASK-001',
  })
  code: string;
  @ApiProperty({
    example: 'This is a description',
  })
  description?: string;
  @ApiProperty({
    example: [
      {
        type: 'info',
        log: 'Task created',
      },
    ],
  })
  logs: {
    type: string;
    log: string;
  }[];
  @ApiProperty({
    example: [
      {
        userId: '123',
        name: 'John Doe',
        avatarUrl: 'https://example.com/avatar.png',
      },
    ],
  })
  assignedTo?: {
    userId: string;
    name: string;
    avatarUrl: string;
  }[];

  @ApiProperty({
    example: 'TASK-000',
  })
  parentTaskId?: string;

  @ApiProperty({
    example: '123',
  })
  statusId: string;

  @ApiProperty({
    example: [
      {
        id: '123',
        name: 'Inventory Item 1',
        serialNumber: 'ABC123456',
      },
    ],
  })
  inventoryItems: InventoryItem[];
}
