import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TransferStatus } from '../../../domain/entities/transfer.entity';
import { CreateTransferResponseDto } from './create-transfer.dto';

export class ListTransfersQueryDto {
  @ApiProperty({ example: '30-12345678-9', description: 'Company taxId to filter transfers by' })
  @IsString()
  @IsNotEmpty()
  taxId!: string;

  @ApiPropertyOptional({
    enum: TransferStatus,
    example: TransferStatus.COMPLETED,
    description: 'Optional transfer status filter',
  })
  @IsOptional()
  @IsEnum(TransferStatus, {
    message: `status must be one of: ${Object.values(TransferStatus).join(', ')}`,
  })
  status?: TransferStatus;

  @ApiPropertyOptional({ example: 10, description: 'Number of items to return', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 0, description: 'Number of items to skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class ListTransfersResponseDto {
  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ type: [CreateTransferResponseDto] })
  items!: CreateTransferResponseDto[];
}
