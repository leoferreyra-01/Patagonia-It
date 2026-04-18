import { Company } from '../entities/company.entity';

export interface CompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findByTaxId(taxId: string): Promise<Company | null>;
  findByRegistrationDateRange(startDate: Date, endDate: Date): Promise<Company[]>;
  save(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
}

export const COMPANY_REPOSITORY = Symbol('COMPANY_REPOSITORY');
