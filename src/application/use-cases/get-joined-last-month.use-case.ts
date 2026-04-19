import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Company } from '../../domain/entities/company.entity';
import { ERROR_CATALOG } from '../../domain/errors/error-codes';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company-repository.port';

@Injectable()
export class GetJoinedLastMonthUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(referenceDate: Date = new Date()): Promise<Company[]> {
    try {
      const endDate = referenceDate;
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 30);

      const companies = await this.companyRepository.findByRegistrationDateRange(
        startDate,
        endDate,
      );

      return companies.sort(
        (a, b) => b.registrationDate.getTime() - a.registrationDate.getTime(),
      );
    } catch {
      throw new InternalServerErrorException({
        code: ERROR_CATALOG.JOINED_LAST_MONTH_FETCH_FAILED.code,
        message: ERROR_CATALOG.JOINED_LAST_MONTH_FETCH_FAILED.message,
        statusCode: ERROR_CATALOG.JOINED_LAST_MONTH_FETCH_FAILED.status,
      });
    }
  }
}
