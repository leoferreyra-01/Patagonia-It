import {
  Company,
  CompanyType,
} from '../../src/domain/entities/company.entity';
import {
  Transfer,
  TransferStatus,
} from '../../src/domain/entities/transfer.entity';
import { CompanyRepository } from '../../src/domain/ports/company-repository.port';
import { TransferRepository } from '../../src/domain/ports/transfer-repository.port';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../src/application/use-cases/get-companies-with-transfers-last-month.use-case';

describe('GetCompaniesWithTransfersLastMonthUseCase', () => {
  it('returns only companies with completed transfers in last 30 days', async () => {
    const companyA = new Company(
      'company-a',
      '30-99999999-7',
      'Company A',
      CompanyType.CORPORATIVA,
      new Date('2026-03-01T00:00:00.000Z'),
      'AR',
    );

    const companyB = new Company(
      'company-b',
      '30-88888888-6',
      'Company B',
      CompanyType.PYME,
      new Date('2026-03-10T00:00:00.000Z'),
      'AR',
    );

    const transferInRange = new Transfer(
      'transfer-1',
      1000,
      'company-a',
      new Date('2026-04-10T00:00:00.000Z'),
      TransferStatus.COMPLETED,
    );

    const pendingTransfer = new Transfer(
      'transfer-2',
      300,
      'company-b',
      new Date('2026-04-12T00:00:00.000Z'),
      TransferStatus.PENDING,
    );

    const companyRepository: CompanyRepository = {
      findAll: jest.fn(),
      findById: jest.fn(async (id: string) => {
        if (id === 'company-a') {
          return companyA;
        }
        if (id === 'company-b') {
          return companyB;
        }
        return null;
      }),
      findByTaxId: jest.fn(),
      findByRegistrationDateRange: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const transferRepository: TransferRepository = {
      save: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(async () => [transferInRange, pendingTransfer]),
      findByCompanyIdAndDateRange: jest.fn(),
    };

    const useCase = new GetCompaniesWithTransfersLastMonthUseCase(
      companyRepository,
      transferRepository,
    );

    const result = await useCase.execute(new Date('2026-04-18T00:00:00.000Z'));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'company-a',
      taxId: '30-99999999-7',
      name: 'Company A',
      transfersInLastMonth: 1,
      totalTransferredAmountLastMonth: 1000,
    });
  });

  it('aggregates per company, keeps latest transfer date, sorts by total amount, and skips unknown company ids', async () => {
    const companyA = new Company(
      'company-a',
      '30-11111111-1',
      'Company A',
      CompanyType.CORPORATIVA,
      new Date('2026-02-01T00:00:00.000Z'),
      'AR',
    );

    const companyB = new Company(
      'company-b',
      '30-22222222-2',
      'Company B',
      CompanyType.PYME,
      new Date('2026-02-01T00:00:00.000Z'),
      'AR',
    );

    const companyRepository: CompanyRepository = {
      findAll: jest.fn(),
      findById: jest.fn(async (id: string) => {
        if (id === 'company-a') {
          return companyA;
        }
        if (id === 'company-b') {
          return companyB;
        }
        return null;
      }),
      findByTaxId: jest.fn(),
      findByRegistrationDateRange: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const transferRepository: TransferRepository = {
      save: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(async () => [
        new Transfer(
          'transfer-1',
          300,
          'company-a',
          new Date('2026-04-02T00:00:00.000Z'),
          TransferStatus.COMPLETED,
        ),
        new Transfer(
          'transfer-2',
          700,
          'company-a',
          new Date('2026-04-17T00:00:00.000Z'),
          TransferStatus.COMPLETED,
        ),
        new Transfer(
          'transfer-3',
          500,
          'company-b',
          new Date('2026-04-10T00:00:00.000Z'),
          TransferStatus.COMPLETED,
        ),
        new Transfer(
          'transfer-4',
          120,
          'company-missing',
          new Date('2026-04-12T00:00:00.000Z'),
          TransferStatus.COMPLETED,
        ),
      ]),
      findByCompanyIdAndDateRange: jest.fn(),
    };

    const useCase = new GetCompaniesWithTransfersLastMonthUseCase(
      companyRepository,
      transferRepository,
    );

    const result = await useCase.execute(new Date('2026-04-18T00:00:00.000Z'));

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'company-a',
      transfersInLastMonth: 2,
      totalTransferredAmountLastMonth: 1000,
      lastTransferDate: '2026-04-17T00:00:00.000Z',
    });
    expect(result[1]).toMatchObject({
      id: 'company-b',
      transfersInLastMonth: 1,
      totalTransferredAmountLastMonth: 500,
    });
  });
});
