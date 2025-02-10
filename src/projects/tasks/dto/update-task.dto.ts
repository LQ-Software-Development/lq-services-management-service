import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @ApiProperty()
    @IsString()
    id: string;
}
