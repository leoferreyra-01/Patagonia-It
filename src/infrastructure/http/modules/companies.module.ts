import { Module } from '@nestjs/common';
import { CreateCompanyUseCase } from '../../../application/use-cases/create-company.use-case';
import { CreateTransferUseCase } from '../../../application/use-cases/create-transfer.use-case';
import { GetJoinedLastMonthUseCase } from '../../../application/use-cases/get-joined-last-month.use-case';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../../application/use-cases/get-companies-with-transfers-last-month.use-case';
import { GetTransfersByCompanyUseCase } from '../../../application/use-cases/get-transfers-by-company.use-case';
import { ListCompaniesUseCase } from '../../../application/use-cases/list-companies.use-case';
import { COMPANY_REPOSITORY } from '../../../domain/ports/company-repository.port';
import { TRANSFER_REPOSITORY } from '../../../domain/ports/transfer-repository.port';
import { CompaniesController } from '../controllers/companies.controller';
import { TransfersController } from '../controllers/transfers.controller';
import { FileStorage } from '../../persistence/file-storage';
import { JsonCompanyRepository } from '../../persistence/json-company.repository';
import { JsonTransferRepository } from '../../persistence/json-transfer.repository';

@Module({
  controllers: [CompaniesController, TransfersController],
  providers: [
    FileStorage,
    JsonCompanyRepository,
    JsonTransferRepository,
    GetCompaniesWithTransfersLastMonthUseCase,
    GetJoinedLastMonthUseCase,
    CreateCompanyUseCase,
    CreateTransferUseCase,
    GetTransfersByCompanyUseCase,
    ListCompaniesUseCase,
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
export class CompaniesModule {}
