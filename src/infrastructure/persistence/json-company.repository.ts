import { Injectable, NotFoundException } from '@nestjs/common';
import { Company } from '../../domain/entities/company.entity';
import { CompanyRepository } from '../../domain/ports/company-repository.port';
import { FileStorage } from './file-storage';

type CompanyRecord = {
  id: string;
  taxId: string;
  name: string;
  type: Company['type'];
  registrationDate: string;
  country: string;
};

@Injectable()
export class JsonCompanyRepository implements CompanyRepository {
  private readonly filePath = 'companies.json';

  constructor(private readonly storage: FileStorage) {}

  async findAll(): Promise<Company[]> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<Company | null> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);
    const found = records.find((company) => company.id === id);
    return found ? this.toDomain(found) : null;
  }

  async findByTaxId(taxId: string): Promise<Company | null> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);
    const found = records.find((company) => company.taxId === taxId);
    return found ? this.toDomain(found) : null;
  }

  async findByRegistrationDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Company[]> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);

    return records
      .filter((record) => {
        const registrationDate = new Date(record.registrationDate);
        return registrationDate >= startDate && registrationDate <= endDate;
      })
      .map((record) => this.toDomain(record));
  }

  async save(company: Company): Promise<Company> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);
    records.push(this.toRecord(company));
    await this.storage.writeArray(this.filePath, records);
    return company;
  }

  async update(company: Company): Promise<Company> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);
    const index = records.findIndex((item) => item.id === company.id);

    if (index === -1) {
      throw new NotFoundException(`Company with id ${company.id} not found`);
    }

    records[index] = this.toRecord(company);
    await this.storage.writeArray(this.filePath, records);
    return company;
  }

  async delete(id: string): Promise<void> {
    const records = await this.storage.readArray<CompanyRecord>(this.filePath);
    const filtered = records.filter((company) => company.id !== id);
    await this.storage.writeArray(this.filePath, filtered);
  }

  private toDomain(record: CompanyRecord): Company {
    return new Company(
      record.id,
      record.taxId,
      record.name,
      record.type,
      new Date(record.registrationDate),
      record.country,
    );
  }

  private toRecord(company: Company): CompanyRecord {
    return {
      id: company.id,
      taxId: company.taxId,
      name: company.name,
      type: company.type,
      registrationDate: company.registrationDate.toISOString(),
      country: company.country,
    };
  }
}
