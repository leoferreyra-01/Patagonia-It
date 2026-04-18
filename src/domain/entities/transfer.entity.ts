import { randomUUID } from 'node:crypto';

export enum TransferStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Transfer {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly companyId: string,
    public readonly date: Date,
    public readonly status: TransferStatus,
  ) {}

  static create(
    amount: number,
    companyId: string,
    status: TransferStatus = TransferStatus.PENDING,
  ): Transfer {
    return new Transfer(randomUUID(), amount, companyId, new Date(), status);
  }
}
