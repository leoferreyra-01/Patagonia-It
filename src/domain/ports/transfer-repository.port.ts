import { Transfer } from '../entities/transfer.entity';

export interface TransferRepository {
  save(transfer: Transfer): Promise<Transfer>;
  findByCompanyId(companyId: string): Promise<Transfer[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]>;
  findByCompanyIdAndDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transfer[]>;
}

export const TRANSFER_REPOSITORY = Symbol('TRANSFER_REPOSITORY');
