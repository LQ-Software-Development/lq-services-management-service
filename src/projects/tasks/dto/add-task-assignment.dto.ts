import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddTaskAssignmentDto {
  @ApiProperty({
    example: "user-123",
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: "John Doe",
  })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    example: "backend",
  })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({
    example: "https://avatar.url",
  })
  @IsString()
  userAvatar?: string;
}
