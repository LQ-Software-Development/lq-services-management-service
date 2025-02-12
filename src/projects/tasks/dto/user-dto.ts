import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { randomUUID } from 'crypto';

export class UserDto {
  @ApiProperty({
    example: randomUUID(),
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;
  @ApiProperty({
    example: 'johndoe@test.com',
  })
  email: string;
  @ApiPropertyOptional({
    example: 'https://placehold.it/100x100',
  })
  avatarUrl?: string;
}
