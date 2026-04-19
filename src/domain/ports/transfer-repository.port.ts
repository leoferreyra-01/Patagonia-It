import { Transfer, TransferStatus } from '../entities/transfer.entity';

export interface TransferFilterOptions {
  status?: TransferStatus;
  limit: number;
  offset: number;
}

export interface TransferRepository {
  save(transfer: Transfer): Promise<Transfer>;
  findByCompanyId(companyId: string): Promise<Transfer[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]>;
  findByCompanyIdAndDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transfer[]>;
  findByCompanyIdWithFilters(
    companyId: string,
    options: TransferFilterOptions,
  ): Promise<{ items: Transfer[]; total: number }>;
}

export const TRANSFER_REPOSITORY = Symbol('TRANSFER_REPOSITORY');
