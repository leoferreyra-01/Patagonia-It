import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransferStatus } from '../../../domain/entities/transfer.entity';

export class CreateTransferRequestDto {
  @ApiProperty({ example: 1200.5 })
  @IsNumber({}, { message: 'amount must be a valid number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  amount!: number;

  @ApiProperty({ example: '3f58f3c4-c20a-4c6f-801f-15e5c31f89ea' })
  @IsString({ message: 'companyId must be a string' })
  @IsNotEmpty({ message: 'companyId is required' })
  companyId!: string;

  @ApiPropertyOptional({
    enum: TransferStatus,
    example: TransferStatus.PENDING,
    default: TransferStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TransferStatus, {
    message: `status must be one of: ${Object.values(TransferStatus).join(', ')}`,
  })
  status?: TransferStatus;
}

export class CreateTransferResponseDto {
  @ApiProperty({ example: '4c2f9b8d-d6a8-4c71-bd91-4d85f31f95fd' })
  id!: string;

  @ApiProperty({ example: 1200.5 })
  amount!: number;

  @ApiProperty({ example: '3f58f3c4-c20a-4c6f-801f-15e5c31f89ea' })
  companyId!: string;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  date!: string;

  @ApiProperty({ enum: TransferStatus, example: TransferStatus.PENDING })
  status!: TransferStatus;
}