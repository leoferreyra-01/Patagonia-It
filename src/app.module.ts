import { Module } from '@nestjs/common';
import { HealthModule } from './infrastructure/http/modules/health.module';
import { CompaniesModule } from './infrastructure/http/modules/companies.module';

@Module({
  imports: [HealthModule, CompaniesModule],
})
export class AppModule {}
