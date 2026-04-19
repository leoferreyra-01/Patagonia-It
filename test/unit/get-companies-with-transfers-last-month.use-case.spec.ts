import {
  Company,
  CompanyType,
} from '../../src/domain/entities/company.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { ERROR_CATALOG } from '../../src/domain/errors/error-codes';
import { PersistenceError } from '../../src/infrastructure/errors/persistence.error';
import {
  Transfer,
  TransferStatus,
} from '../../src/domain/entities/transfer.entity';
import { CompanyRepository } from '../../src/domain/ports/company-repository.port';
import { TransferRepository } from '../../src/domain/ports/transfer-repository.port';
import { GetCompaniesWithTransfersLastMonthUseCase } from '../../src/application/use-cases/get-companies-with-transfers-last-month.use-case';

describe('GetCompaniesWithTransfersLastMonthUseCase', () => {
  const referenceDate = new Date('2026-04-18T00:00:00.000Z');

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
        findByType: jest.fn(),
        findByTypeAndCountry: jest.fn(),
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

    const result = await useCase.execute(referenceDate);

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
      findByType: jest.fn(),
      findByTypeAndCountry: jest.fn(),
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

    const result = await useCase.execute(referenceDate);

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

  it('throws catalog-backed 500 when repository fails', async () => {
    const companyRepository: CompanyRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
        findByType: jest.fn(),
        findByTypeAndCountry: jest.fn(),
      findByTaxId: jest.fn(),
      findByRegistrationDateRange: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const transferRepository: TransferRepository = {
      save: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(async () => {
        throw new Error('db read failure');
      }),
      findByCompanyIdAndDateRange: jest.fn(),
    };

    const useCase = new GetCompaniesWithTransfersLastMonthUseCase(
      companyRepository,
      transferRepository,
    );

    await expect(useCase.execute(referenceDate)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );

    try {
      await useCase.execute(referenceDate);
    } catch (error) {
      const response = (error as InternalServerErrorException).getResponse() as {
        code: string;
        message: string;
        statusCode: number;
      };
      expect(response).toEqual({
        code: ERROR_CATALOG.WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED.code,
        message: ERROR_CATALOG.WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED.message,
        statusCode: ERROR_CATALOG.WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED.status,
      });
    }
  });

  it('rethrows retryable persistence errors without masking their code', async () => {
    const companyRepository: CompanyRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      findByTypeAndCountry: jest.fn(),
      findByTaxId: jest.fn(),
      findByRegistrationDateRange: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const transferRepository: TransferRepository = {
      save: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(async () => {
        throw PersistenceError.read('transfers.json', new Error('storage offline'));
      }),
      findByCompanyIdAndDateRange: jest.fn(),
    };

    const useCase = new GetCompaniesWithTransfersLastMonthUseCase(
      companyRepository,
      transferRepository,
    );

    await expect(useCase.execute(referenceDate)).rejects.toMatchObject({
      code: ERROR_CATALOG.PERSISTENCE_READ_FAILED.code,
      message: ERROR_CATALOG.PERSISTENCE_READ_FAILED.message,
      statusCode: ERROR_CATALOG.PERSISTENCE_READ_FAILED.status,
      retryable: true,
    });
  });

  it('filters by status when provided (PENDING)', async () => {
    const company = new Company(
      'company-a',
      '30-99999999-7',
      'Company A',
      CompanyType.CORPORATIVA,
      new Date('2026-03-01T00:00:00.000Z'),
      'AR',
    );

    const companyRepository: CompanyRepository = {
      findAll: jest.fn(),
      findById: jest.fn(async () => company),
      findByTaxId: jest.fn(),
      findByRegistrationDateRange: jest.fn(),
      findByType: jest.fn(),
      findByTypeAndCountry: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const transferRepository: TransferRepository = {
      save: jest.fn(),
      findByCompanyId: jest.fn(),
      findByDateRange: jest.fn(async () => [
        new Transfer(
          'transfer-completed',
          100,
          'company-a',
          new Date('2026-04-10T00:00:00.000Z'),
          TransferStatus.COMPLETED,
        ),
        new Transfer(
          'transfer-pending',
          200,
          'company-a',
          new Date('2026-04-11T00:00:00.000Z'),
          TransferStatus.PENDING,
        ),
      ]),
      findByCompanyIdAndDateRange: jest.fn(),
    };

    const useCase = new GetCompaniesWithTransfersLastMonthUseCase(
      companyRepository,
      transferRepository,
    );

    const result = await useCase.execute(referenceDate, TransferStatus.PENDING);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'company-a',
      transfersInLastMonth: 1,
      totalTransferredAmountLastMonth: 200,
      lastTransferDate: '2026-04-11T00:00:00.000Z',
    });
  });
});
