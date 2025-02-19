import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsDateString, IsUUID } from "class-validator";

export class ListTasksFilterDto {
  @ApiPropertyOptional({ description: "Filtrar por usuário atribuído" })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: "Filtrar por projeto" })
  @IsUUID()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por status (PENDING, IN_PROGRESS, COMPLETED)",
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: "Filtrar por data de início mínima" })
  @IsDateString()
  @IsOptional()
  startDateFrom?: Date;

  @ApiPropertyOptional({ description: "Filtrar por data de início máxima" })
  @IsDateString()
  @IsOptional()
  startDateTo?: Date;

  @ApiPropertyOptional({ description: "Filtrar por data de término mínima" })
  @IsDateString()
  @IsOptional()
  endDateFrom?: Date;

  @ApiPropertyOptional({ description: "Filtrar por data de término máxima" })
  @IsDateString()
  @IsOptional()
  endDateTo?: Date;

  @ApiPropertyOptional({
    description: "Filtrar tasks ativas na data atual (true/false)",
  })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Filtrar tarefas não completas. (true: filtra tarefas cujo status não é "COMPLETED")',
  })
  @IsOptional()
  isNotComplete?: boolean;

  @ApiPropertyOptional({ description: "Número da página" })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: "Limite de itens por página" })
  @IsOptional()
  limit?: number;
}
