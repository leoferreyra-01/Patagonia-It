import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TransferStatus } from '../../../domain/entities/transfer.entity';

export class CompaniesWithTransfersLastMonthQueryDto {
  @ApiPropertyOptional({
    enum: TransferStatus,
    example: TransferStatus.COMPLETED,
    description: 'Optional transfer status filter. Defaults to COMPLETED when omitted.',
  })
  @IsOptional()
  @IsEnum(TransferStatus, {
    message: `status must be one of: ${Object.values(TransferStatus).join(', ')}`,
  })
  status?: TransferStatus;
}