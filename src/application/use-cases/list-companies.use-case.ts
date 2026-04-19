import { Injectable, Inject } from '@nestjs/common';
import { Company, CompanyType } from '../../domain/entities/company.entity';
import {
  CompanyRepository,
  COMPANY_REPOSITORY,
  PaginationOptions,
} from '../../domain/ports/company-repository.port';

export interface ListCompaniesQuery {
  type?: CompanyType;
  country?: string;
  limit: number;
  offset: number;
}

export interface ListCompaniesResult {
  items: Company[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(query: ListCompaniesQuery): Promise<ListCompaniesResult> {
    const paginationOptions: PaginationOptions = {
      limit: query.limit,
      offset: query.offset,
    };

    let result;

    if (query.type && query.country) {
      result = await this.companyRepository.findByTypeAndCountry(
        query.type,
        query.country,
        paginationOptions,
      );
    } else if (query.type) {
      result = await this.companyRepository.findByType(
        query.type,
        paginationOptions,
      );
    } else {
      // When no filters, return all with pagination
      const all = await this.companyRepository.findAll();
      const items = all.slice(
        query.offset,
        query.offset + query.limit,
      );
      result = { items, total: all.length };
    }

    return {
      items: result.items,
      total: result.total,
      limit: query.limit,
      offset: query.offset,
    };
  }
}
