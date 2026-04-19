import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, Matches, IsOptional, MaxLength } from 'class-validator';
import { CompanyType } from '../../../domain/entities/company.entity';
import { TAX_ID_REGEX, TAX_ID_FORMAT } from '../../../domain/constants/company.constants';

export class CreateCompanyRequestDto {
  @ApiProperty({ example: '30-99999999-7' })
  @IsNotEmpty({ message: 'taxId is required' })
  @Matches(TAX_ID_REGEX, {
    message: `taxId must match format ${TAX_ID_FORMAT}`,
  })
  taxId!: string;

  @ApiProperty({ example: 'Acme SA' })
  @IsNotEmpty({ message: 'name is required' })
  @MaxLength(255, { message: 'name must not exceed 255 characters' })
  name!: string;

  @ApiProperty({ enum: CompanyType, example: CompanyType.PYME })
  @IsNotEmpty({ message: 'type is required' })
  @IsEnum(CompanyType, {
    message: `type must be one of: ${Object.values(CompanyType).join(', ')}`,
  })
  type!: CompanyType;

  @ApiPropertyOptional({ example: 'AR', default: 'AR' })
  @IsOptional()
  @MaxLength(2, { message: 'country must be a 2-letter code' })
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
