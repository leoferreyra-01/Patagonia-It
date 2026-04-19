import { Company } from '../entities/company.entity';

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface CompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findByTaxId(taxId: string): Promise<Company | null>;
  findByRegistrationDateRange(startDate: Date, endDate: Date): Promise<Company[]>;
  findByType(
    type: Company['type'],
    options: PaginationOptions,
  ): Promise<{ items: Company[]; total: number }>;
  findByTypeAndCountry(
    type: Company['type'],
    country: string,
    options: PaginationOptions,
  ): Promise<{ items: Company[]; total: number }>;
  save(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
}

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');
