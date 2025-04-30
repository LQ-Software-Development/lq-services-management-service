import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, IsPositive, IsDateString } from 'class-validator';

export class SaleConfirmedDto {
    @ApiProperty({ description: 'Identificador único da venda' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'ID da organização', required: false })
    @IsUUID()
    @IsOptional()
    organizationId?: string;

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

    @ApiProperty({ description: 'ID do projeto' })
    @IsOptional()
    @IsPositive()
    durationInMinutes: number;


    @ApiProperty({ description: 'Data de início do serviço' })
    @IsDateString()
    date: Date;

    @ApiProperty({ description: 'Tipo de item' })
    @IsString()
    type: 'service' | 'product';
}