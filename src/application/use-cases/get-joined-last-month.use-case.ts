import { Inject, Injectable } from '@nestjs/common';
import { Company } from '../../domain/entities/company.entity';
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
  }
}
