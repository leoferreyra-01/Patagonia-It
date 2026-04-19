import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Company, CompanyType } from '../../domain/entities/company.entity';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company-repository.port';

export type CreateCompanyCommand = {
  taxId: string;
  name: string;
  type: CompanyType;
  country?: string;
};

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(command: CreateCompanyCommand): Promise<Company> {
    this.validate(command);

    const existingCompany = await this.companyRepository.findByTaxId(command.taxId);
    if (existingCompany) {
      throw new ConflictException(`Company with taxId ${command.taxId} already exists`);
    }

    const company = Company.create(
      command.taxId,
      command.name.trim(),
      command.type,
      command.country?.trim() || 'AR',
    );

    return this.companyRepository.save(company);
  }

  private validate(command: CreateCompanyCommand): void {
    if (!command.taxId || typeof command.taxId !== 'string') {
      throw new BadRequestException('taxId is required and must be a string');
    }

    if (!/^\d{2}-\d{8}-\d$/.test(command.taxId)) {
      throw new BadRequestException('taxId format must be NN-NNNNNNNN-N');
    }

    if (!command.name || typeof command.name !== 'string' || !command.name.trim()) {
      throw new BadRequestException('name is required and must be a non-empty string');
    }

    if (!Object.values(CompanyType).includes(command.type)) {
      throw new BadRequestException('type must be PYME or CORPORATIVA');
    }

    if (command.country !== undefined) {
      if (typeof command.country !== 'string' || !command.country.trim()) {
        throw new BadRequestException('country must be a non-empty string when provided');
      }
    }
  }
}
