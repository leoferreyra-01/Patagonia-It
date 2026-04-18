import {
  Transfer,
  TransferStatus,
} from '../../src/domain/entities/transfer.entity';
import { FileStorage } from '../../src/infrastructure/persistence/file-storage';
import { JsonTransferRepository } from '../../src/infrastructure/persistence/json-transfer.repository';

describe('JsonTransferRepository', () => {
  let storage: jest.Mocked<FileStorage>;
  let repository: JsonTransferRepository;

  const transferRecord = {
    id: 'transfer-1',
    amount: 1200,
    companyId: 'company-1',
    date: '2026-04-10T00:00:00.000Z',
    status: TransferStatus.COMPLETED,
  };

  beforeEach(() => {
    storage = {
      readArray: jest.fn(),
      writeArray: jest.fn(),
    } as unknown as jest.Mocked<FileStorage>;

    repository = new JsonTransferRepository(storage);
  });

  it('save appends and persists transfer', async () => {
    storage.readArray.mockResolvedValue([transferRecord]);

    const transfer = new Transfer(
      'transfer-2',
      500,
      'company-2',
      new Date('2026-04-11T00:00:00.000Z'),
      TransferStatus.PENDING,
    );

    await repository.save(transfer);

    expect(storage.writeArray).toHaveBeenCalledTimes(1);
    const persisted = storage.writeArray.mock.calls[0][1] as Array<{ id: string }>;
    expect(persisted).toHaveLength(2);
    expect(persisted[1].id).toBe('transfer-2');
  });

  it('findByCompanyId returns mapped transfers for a company', async () => {
    storage.readArray.mockResolvedValue([
      transferRecord,
      {
        ...transferRecord,
        id: 'transfer-2',
        companyId: 'company-2',
      },
    ]);

    const result = await repository.findByCompanyId('company-1');

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Transfer);
    expect(result[0].id).toBe('transfer-1');
  });

  it('findByDateRange filters transfers by date interval', async () => {
    storage.readArray.mockResolvedValue([
      transferRecord,
      {
        ...transferRecord,
        id: 'transfer-2',
        date: '2026-02-10T00:00:00.000Z',
      },
    ]);

    const result = await repository.findByDateRange(
      new Date('2026-04-01T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('transfer-1');
  });

  it('findByCompanyIdAndDateRange filters by company and date', async () => {
    storage.readArray.mockResolvedValue([
      transferRecord,
      {
        ...transferRecord,
        id: 'transfer-2',
        companyId: 'company-2',
        date: '2026-04-11T00:00:00.000Z',
      },
      {
        ...transferRecord,
        id: 'transfer-3',
        companyId: 'company-1',
        date: '2026-02-01T00:00:00.000Z',
      },
    ]);

    const result = await repository.findByCompanyIdAndDateRange(
      'company-1',
      new Date('2026-04-01T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('transfer-1');
  });
});
