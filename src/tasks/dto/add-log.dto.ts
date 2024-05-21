import { ApiProperty } from "@nestjs/swagger";

export class AddLogDto {
  @ApiProperty({
    example: 'COMMENT'
  })
  type: string;
  @ApiProperty({
    example: 'This is a comment'
  })
  log: string;
}
