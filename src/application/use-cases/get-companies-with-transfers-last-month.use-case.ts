import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CompanyType } from '../../domain/entities/company.entity';
import { ERROR_CATALOG } from '../../domain/errors/error-codes';
import { TransferStatus } from '../../domain/entities/transfer.entity';
import {
  COMPANY_REPOSITORY,
  CompanyRepository,
} from '../../domain/ports/company-repository.port';
import {
  TRANSFER_REPOSITORY,
  TransferRepository,
} from '../../domain/ports/transfer-repository.port';
import { PersistenceError } from '../../infrastructure/errors/persistence.error';

export type CompanyWithTransferSummary = {
  id: string;
  taxId: string;
  name: string;
  type: CompanyType;
  country: string;
  registrationDate: string;
  transfersInLastMonth: number;
  totalTransferredAmountLastMonth: number;
  lastTransferDate: string;
};

@Injectable()
export class GetCompaniesWithTransfersLastMonthUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(TRANSFER_REPOSITORY)
    private readonly transferRepository: TransferRepository,
  ) {}

  async execute(
    referenceDate: Date = new Date(),
    status: TransferStatus = TransferStatus.COMPLETED,
  ): Promise<CompanyWithTransferSummary[]> {
    try {
      const endDate = referenceDate;
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - 30);

      const transfers = await this.transferRepository.findByDateRange(startDate, endDate);
      const filteredTransfers = transfers.filter(
        (transfer) => transfer.status === status,
      );

      const summaryByCompanyId = new Map<
        string,
        { count: number; totalAmount: number; lastDate: Date }
      >();

      for (const transfer of filteredTransfers) {
        const current = summaryByCompanyId.get(transfer.companyId);
        if (!current) {
          summaryByCompanyId.set(transfer.companyId, {
            count: 1,
            totalAmount: transfer.amount,
            lastDate: transfer.date,
          });
          continue;
        }

        summaryByCompanyId.set(transfer.companyId, {
          count: current.count + 1,
          totalAmount: current.totalAmount + transfer.amount,
          lastDate: new Date(
            Math.max(transfer.date.getTime(), current.lastDate.getTime()),
          ),
        });
      }

      const companies = await Promise.all(
        Array.from(summaryByCompanyId.keys()).map((companyId) =>
          this.companyRepository.findById(companyId),
        ),
      );

      const response: CompanyWithTransferSummary[] = [];

      for (const company of companies) {
        if (!company) {
          continue;
        }

        const summary = summaryByCompanyId.get(company.id);
        if (!summary) {
          continue;
        }

        response.push({
          id: company.id,
          taxId: company.taxId,
          name: company.name,
          type: company.type,
          country: company.country,
          registrationDate: company.registrationDate.toISOString(),
          transfersInLastMonth: summary.count,
          totalTransferredAmountLastMonth: summary.totalAmount,
          lastTransferDate: summary.lastDate.toISOString(),
        });
      }

      return response.sort(
        (a, b) => b.totalTransferredAmountLastMonth - a.totalTransferredAmountLastMonth,
      );
    } catch (error) {
      if (error instanceof PersistenceError) {
        throw error;
      }

      throw new InternalServerErrorException({
        code: ERROR_CATALOG.WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED.code,
        message: ERROR_CATALOG.WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED.message,
        statusCode: ERROR_CATALOG.WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED.status,
      });
    }
  }
}
