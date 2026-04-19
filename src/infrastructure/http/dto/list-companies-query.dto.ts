import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { CompanyType } from '../../../domain/entities/company.entity';

export class ListCompaniesQueryDto {
  @ApiPropertyOptional({
    enum: CompanyType,
    description: 'Filter by company type',
  })
  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @ApiPropertyOptional({
    example: 'AR',
    description: 'Filter by country code',
  })
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items to return',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of items to skip',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class PaginatedResponseDto<T> {
  total!: number;
  limit!: number;
  offset!: number;
  items!: T[];
}
