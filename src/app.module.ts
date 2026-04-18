import { Module } from '@nestjs/common';
import { COMPANY_REPOSITORY } from './domain/ports/company-repository.port';
import { TRANSFER_REPOSITORY } from './domain/ports/transfer-repository.port';
import { HealthController } from './health.controller';
import { FileStorage } from './infrastructure/persistence/file-storage';
import { JsonCompanyRepository } from './infrastructure/persistence/json-company.repository';
import { JsonTransferRepository } from './infrastructure/persistence/json-transfer.repository';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [
    FileStorage,
    JsonCompanyRepository,
    JsonTransferRepository,
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
