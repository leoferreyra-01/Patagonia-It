import { Injectable } from '@nestjs/common';
import { Transfer } from '../../domain/entities/transfer.entity';
import { TransferRepository } from '../../domain/ports/transfer-repository.port';
import { FileStorage } from './file-storage';

type TransferRecord = {
  id: string;
  amount: number;
  companyId: string;
  date: string;
  status: Transfer['status'];
};

@Injectable()
export class JsonTransferRepository implements TransferRepository {
  private readonly filePath = 'data/transfers.json';

  constructor(private readonly storage: FileStorage) {}

  async save(transfer: Transfer): Promise<Transfer> {
    const records = await this.storage.readArray<TransferRecord>(this.filePath);
    records.push(this.toRecord(transfer));
    await this.storage.writeArray(this.filePath, records);
    return transfer;
  }

  async findByCompanyId(companyId: string): Promise<Transfer[]> {
    const records = await this.storage.readArray<TransferRecord>(this.filePath);
    return records
      .filter((transfer) => transfer.companyId === companyId)
      .map((record) => this.toDomain(record));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transfer[]> {
    const records = await this.storage.readArray<TransferRecord>(this.filePath);
    return records
      .filter((record) => {
        const transferDate = new Date(record.date);
        return transferDate >= startDate && transferDate <= endDate;
      })
      .map((record) => this.toDomain(record));
  }

  async findByCompanyIdAndDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Transfer[]> {
    const records = await this.storage.readArray<TransferRecord>(this.filePath);
    return records
      .filter((record) => {
        const transferDate = new Date(record.date);
        return (
          record.companyId === companyId &&
          transferDate >= startDate &&
          transferDate <= endDate
        );
      })
      .map((record) => this.toDomain(record));
  }

  private toDomain(record: TransferRecord): Transfer {
    return new Transfer(
      record.id,
      record.amount,
      record.companyId,
      new Date(record.date),
      record.status,
    );
  }

  private toRecord(transfer: Transfer): TransferRecord {
    return {
      id: transfer.id,
      amount: transfer.amount,
      companyId: transfer.companyId,
      date: transfer.date.toISOString(),
      status: transfer.status,
    };
  }
}
