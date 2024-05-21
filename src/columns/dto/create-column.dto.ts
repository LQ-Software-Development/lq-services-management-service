import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateColumnDto {
    @ApiProperty({
        example: 'Done'
    })
    name: string;
    @ApiProperty({
        example: true
    })
    isCompleted: boolean;
    @ApiPropertyOptional({
        example: '#000000'
    })
    color?: string;
    @ApiPropertyOptional({
        example: 10
    })
    taskLimit?: number;
}
