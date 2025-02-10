import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { randomUUID } from 'crypto';

export class AddLogDto {
  @ApiProperty({
    example: randomUUID(),
  })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({
    example: 'COMMENT',
  })
  type: string;
  @ApiProperty({
    example: 'This is a comment',
  })
  log: string;
}
