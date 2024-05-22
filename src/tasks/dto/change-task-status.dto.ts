import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeTaskStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @ApiProperty({
    description: 'The status column id',
  })
  @IsNotEmpty()
  @IsString()
  statusId: string;
}
