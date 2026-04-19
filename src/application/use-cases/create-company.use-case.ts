import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  COMPANY_TYPES,
  DEFAULT_COMPANY_COUNTRY,
  TAX_ID_FORMAT,
} from '../../domain/constants/company.constants';
import { Company, CompanyType } from '../../domain/entities/company.entity';
import { ERROR_CATALOG } from '../../domain/errors/error-codes';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company-repository.port';
import { isValidTaxId } from '../../domain/validators/tax-id.validator';

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
      throw new ConflictException(
        ERROR_CATALOG.COMPANY_TAX_ID_ALREADY_EXISTS.message.replace('%s', command.taxId),
      );
    }

    const company = Company.create(
      command.taxId,
      command.name.trim(),
      command.type,
      command.country?.trim() || DEFAULT_COMPANY_COUNTRY,
    );

    return this.companyRepository.save(company);
  }

  private validate(command: CreateCompanyCommand): void {
    if (!command.taxId || typeof command.taxId !== 'string') {
      throw new BadRequestException(ERROR_CATALOG.TAX_ID_REQUIRED.message);
    }

    if (!isValidTaxId(command.taxId)) {
      throw new BadRequestException(
        ERROR_CATALOG.INVALID_TAX_ID_FORMAT.message.replace('NN-NNNNNNNN-N', TAX_ID_FORMAT),
      );
    }

    if (!command.name || typeof command.name !== 'string' || !command.name.trim()) {
      throw new BadRequestException(ERROR_CATALOG.NAME_REQUIRED.message);
    }

    if (!COMPANY_TYPES.includes(command.type)) {
      throw new BadRequestException(ERROR_CATALOG.INVALID_COMPANY_TYPE.message);
    }

    if (command.country !== undefined) {
      if (typeof command.country !== 'string' || !command.country.trim()) {
        throw new BadRequestException(ERROR_CATALOG.INVALID_COUNTRY.message);
      }
    }
  }
}
