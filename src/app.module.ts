import { Module } from '@nestjs/common';
import { CreateCompanyUseCase } from './application/use-cases/create-company.use-case';
import { GetJoinedLastMonthUseCase } from './application/use-cases/get-joined-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from './application/use-cases/get-companies-with-transfers-last-month.use-case';
import { COMPANY_REPOSITORY } from './domain/ports/company-repository.port';
import { TRANSFER_REPOSITORY } from './domain/ports/transfer-repository.port';
import { HealthController } from './health.controller';
import { CompaniesController } from './infrastructure/http/controllers/companies.controller';
import { FileStorage } from './infrastructure/persistence/file-storage';
import { JsonCompanyRepository } from './infrastructure/persistence/json-company.repository';
import { JsonTransferRepository } from './infrastructure/persistence/json-transfer.repository';

@Module({
  imports: [],
  controllers: [HealthController, CompaniesController],
  providers: [
    FileStorage,
    JsonCompanyRepository,
    JsonTransferRepository,
    GetCompaniesWithTransfersLastMonthUseCase,
    GetJoinedLastMonthUseCase,
    CreateCompanyUseCase,
    {
      provide: COMPANY_REPOSITORY,
      useExisting: JsonCompanyRepository,
    },
    {
      provide: TRANSFER_REPOSITORY,
      useExisting: JsonTransferRepository,
    },
  ],
  exports: [COMPANY_REPOSITORY, TRANSFER_REPOSITORY],
})
export class AppModule {}
