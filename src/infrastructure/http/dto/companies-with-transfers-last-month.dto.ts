import { ApiProperty } from '@nestjs/swagger';
import { CompanyType } from '../../../domain/entities/company.entity';

export class CompanyWithTransfersLastMonthItemDto {
  @ApiProperty({ example: '3f58f3c4-c20a-4c6f-801f-15e5c31f89ea' })
  id!: string;

  @ApiProperty({ example: '30-99999999-7' })
  taxId!: string;

  @ApiProperty({ example: 'Acme SA' })
  name!: string;

  @ApiProperty({ enum: CompanyType, example: CompanyType.CORPORATIVA })
  type!: CompanyType;

  @ApiProperty({ example: 'AR' })
  country!: string;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  registrationDate!: string;

  @ApiProperty({ example: 4 })
  transfersInLastMonth!: number;

  @ApiProperty({ example: 14500.75 })
  totalTransferredAmountLastMonth!: number;

  @ApiProperty({ example: '2026-04-16T09:15:00.000Z' })
  lastTransferDate!: string;
}

export class CompaniesWithTransfersLastMonthResponseDto {
  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({
    type: CompanyWithTransfersLastMonthItemDto,
    isArray: true,
  })
  items!: CompanyWithTransfersLastMonthItemDto[];
}
