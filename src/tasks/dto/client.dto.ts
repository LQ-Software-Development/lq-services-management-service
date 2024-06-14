import { ApiProperty } from '@nestjs/swagger';

export class ClientDto {
  @ApiProperty({
    example: 'johndoe@test.com',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    example: 'https://placehold.it/100x100',
  })
  address?: string;
}
