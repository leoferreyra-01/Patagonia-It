import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './infrastructure/http/modules/health.module';
import { CompaniesModule } from './infrastructure/http/modules/companies.module';
import { RequestContextInterceptor } from './infrastructure/http/interceptors/request-context.interceptor';
import { StructuredLoggerService } from './infrastructure/logging/structured-logger.service';

@Module({
  imports: [HealthModule, CompaniesModule],
  providers: [
    StructuredLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
export class AppModule {}
