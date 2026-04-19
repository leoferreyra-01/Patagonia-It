import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyType } from '../../../domain/entities/company.entity';

export class CreateCompanyRequestDto {
  @ApiProperty({ example: '30-99999999-7' })
  taxId!: string;

  @ApiProperty({ example: 'Acme SA' })
  name!: string;

  @ApiProperty({ enum: CompanyType, example: CompanyType.PYME })
  type!: CompanyType;

  @ApiPropertyOptional({ example: 'AR', default: 'AR' })
  country?: string;
}

export class CreateCompanyResponseDto {
  @ApiProperty({ example: '3f58f3c4-c20a-4c6f-801f-15e5c31f89ea' })
  id!: string;

  @ApiProperty({ example: '30-99999999-7' })
  taxId!: string;

  @ApiProperty({ example: 'Acme SA' })
  name!: string;

  @ApiProperty({ enum: CompanyType, example: CompanyType.PYME })
  type!: CompanyType;

  @ApiProperty({ example: 'AR' })
  country!: string;

  @ApiProperty({ example: '2026-04-18T12:00:00.000Z' })
  registrationDate!: string;
}
