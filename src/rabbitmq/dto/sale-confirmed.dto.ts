import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, IsPositive, IsDateString, IsObject } from 'class-validator';

export class SaleConfirmedDto {
    @ApiProperty({ description: 'Identificador único da venda' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'ID da organização', required: false })
    @IsString()
    @IsOptional()
    organizationId?: string;

    @ApiProperty({ description: 'Data do pedido' })
    @IsDateString()
    date: Date;

    @ApiProperty({ description: 'Dados do cliente' })
    @IsObject()
    @IsOptional()
    customer?: Record<string, any>;

    @ApiProperty({ description: 'Id do cliente' })
    @IsString()
    @IsOptional()
    customerId?: string;

    @ApiProperty({ description: 'Id do projeto' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiProperty({ description: 'Itens do pedido' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleConfirmedItemDto)
    items: SaleConfirmedItemDto[];
}

export class SaleConfirmedItemDto {
    @ApiProperty({ description: 'ID do item' })
    @IsUUID()
    itemId: string;

    @ApiProperty({ description: 'Nome do serviço ou produto' })
    @IsString()
    itemName: string;

    @ApiProperty({ description: 'Tipo de item' })
    @IsString()
    type: 'service' | 'product';

    @ApiProperty({ description: 'Dados adicionais do item' })
    @IsObject()
    @IsOptional()
    metadata?: {
        scheduledAt?: string;
    };
}