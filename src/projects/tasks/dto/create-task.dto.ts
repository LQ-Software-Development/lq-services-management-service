import { ApiPropertyOptional } from "@nestjs/swagger";
import { randomUUID } from "crypto";
import { IsArray, IsOptional } from "class-validator";

export class TaskAssignmentDto {
  @ApiPropertyOptional({
    example: "user-123",
  })
  userId: string;

  @ApiPropertyOptional({
    example: "John Doe",
  })
  userName: string;

  @ApiPropertyOptional({
    example: "https://avatar.url",
  })
  userAvatar?: string;

  @ApiPropertyOptional({
    example: "backend",
  })
  role: string;
}

export class CreateTaskDto {
  @ApiPropertyOptional({
    example: "Tarefa de teste",
  })
  title?: string;

  @ApiPropertyOptional({
    example: "Descrição da tarefa",
  })
  description?: string;

  @ApiPropertyOptional({
    example: 100,
  })
  value?: number;

  @ApiPropertyOptional({
    example: "PENDING",
  })
  status?: string;

  @ApiPropertyOptional({
    example: "HIGH",
  })
  priority?: string;

  @ApiPropertyOptional({
    example: "2025-01-01",
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    example: "2025-01-01",
  })
  startDate?: Date;

  @ApiPropertyOptional({
    example: "2025-01-01",
  })
  endDate?: Date;

  @ApiPropertyOptional({
    example: randomUUID(),
  })
  parentTaskId?: string;

  @ApiPropertyOptional({
    example: [
      {
        title: "Usuário deve ser autenticado",
        description: `
          Dado: O usuário está na tela de login
          Quando: O usuário insere seu email e senha
          E: Clica no botão de login
          Então: O usuário deve ser autenticado
        `,
      },
    ],
  })
  approvalCriteria?: {
    title: string;
    description: string;
  }[];

  @ApiPropertyOptional({
    example: [
      {
        userId: "user-123",
        userName: "John Doe",
        userAvatar: "https://avatar.url",
        role: "backend",
      },
    ],
  })
  @IsOptional()
  @IsArray()
  assignments?: TaskAssignmentDto[];
}
