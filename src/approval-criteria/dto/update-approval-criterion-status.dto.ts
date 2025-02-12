import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateApprovalCriterionStatusDto {
  @ApiProperty({
    description:
      'Novo status do critério de aprovação. Exemplo: "APROVADO" ou "REJEITADO"',
    example: "APROVADO",
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: "Indica se o critério foi aprovado ou não",
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;

  @ApiPropertyOptional({
    description: "Comentário do revisor ao atualizar o critério",
    example:
      "A funcionalidade está correta, porém sugiro ajustes na interface.",
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
