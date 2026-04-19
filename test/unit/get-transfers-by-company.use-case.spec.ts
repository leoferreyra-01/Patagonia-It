import { NotFoundException } from '@nestjs/common';
import { Company, CompanyType } from '../../src/domain/entities/company.entity';
import { Transfer, TransferStatus } from '../../src/domain/entities/transfer.entity';
import { CompanyRepository } from '../../src/domain/ports/company-repository.port';
import { TransferRepository } from '../../src/domain/ports/transfer-repository.port';
import {
  GetTransfersByCompanyUseCase,
} from '../../src/application/use-cases/get-transfers-by-company.use-case';

describe('GetTransfersByCompanyUseCase', () => {
  const existingCompany = new Company(
    'company-1',
    '30-12345678-9',
    'Acme SA',
    CompanyType.PYME,
    new Date('2026-04-01T00:00:00.000Z'),
    'AR',
  );

  const makeTransferRepository = (
    overrides: Partial<TransferRepository> = {},
  ): TransferRepository => ({
    save: jest.fn(),
    findByCompanyId: jest.fn(),
    findByDateRange: jest.fn(),
    findByCompanyIdAndDateRange: jest.fn(),
    findByCompanyIdWithFilters: jest.fn(async () => ({ items: [], total: 0 })),
    ...overrides,
  });

  const makeCompanyRepository = (
    overrides: Partial<CompanyRepository> = {},
  ): CompanyRepository => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByTaxId: jest.fn(async () => existingCompany),
    findByRegistrationDateRange: jest.fn(),
    findByType: jest.fn(),
    findByTypeAndCountry: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  });

  it('returns paginated transfers for a valid taxId', async () => {
    const transfers = [
      new Transfer('t-1', 500, 'company-1', new Date('2026-04-10T00:00:00.000Z'), TransferStatus.COMPLETED),
      new Transfer('t-2', 200, 'company-1', new Date('2026-04-11T00:00:00.000Z'), TransferStatus.PENDING),
    ];

    const transferRepository = makeTransferRepository({
      findByCompanyIdWithFilters: jest.fn(async () => ({ items: transfers, total: 2 })),
    });
    const companyRepository = makeCompanyRepository();

    const useCase = new GetTransfersByCompanyUseCase(companyRepository, transferRepository);

    const result = await useCase.execute({ taxId: '30-12345678-9', limit: 10, offset: 0 });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
    expect(transferRepository.findByCompanyIdWithFilters).toHaveBeenCalledWith('company-1', {
      status: undefined,
      limit: 10,
      offset: 0,
    });
  });

  it('passes status filter to repository', async () => {
    const transferRepository = makeTransferRepository({
      findByCompanyIdWithFilters: jest.fn(async () => ({ items: [], total: 0 })),
    });
    const companyRepository = makeCompanyRepository();

    const useCase = new GetTransfersByCompanyUseCase(companyRepository, transferRepository);

    await useCase.execute({ taxId: '30-12345678-9', status: TransferStatus.PENDING, limit: 5, offset: 0 });

    expect(transferRepository.findByCompanyIdWithFilters).toHaveBeenCalledWith('company-1', {
      status: TransferStatus.PENDING,
      limit: 5,
      offset: 0,
    });
  });

  it('throws NotFoundException when taxId does not match any company', async () => {
    const companyRepository = makeCompanyRepository({
      findByTaxId: jest.fn(async () => null),
    });
    const transferRepository = makeTransferRepository();

    const useCase = new GetTransfersByCompanyUseCase(companyRepository, transferRepository);

    await expect(
      useCase.execute({ taxId: '30-99999999-9', limit: 10, offset: 0 }),
    ).rejects.toMatchObject({
      status: 404,
      response: {
        code: 'COMPANY_TAX_ID_NOT_FOUND',
        message: 'Company with taxId 30-99999999-9 not found',
        statusCode: 404,
      },
    });
  });

  it('returns empty items when company has no transfers', async () => {
    const companyRepository = makeCompanyRepository();
    const transferRepository = makeTransferRepository({
      findByCompanyIdWithFilters: jest.fn(async () => ({ items: [], total: 0 })),
    });

    const useCase = new GetTransfersByCompanyUseCase(companyRepository, transferRepository);

    const result = await useCase.execute({ taxId: '30-12345678-9', limit: 10, offset: 0 });

    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it('returns correct pagination metadata', async () => {
    const transfers = [
      new Transfer('t-3', 300, 'company-1', new Date(), TransferStatus.COMPLETED),
    ];
    const transferRepository = makeTransferRepository({
      findByCompanyIdWithFilters: jest.fn(async () => ({ items: transfers, total: 11 })),
    });
    const companyRepository = makeCompanyRepository();

    const useCase = new GetTransfersByCompanyUseCase(companyRepository, transferRepository);

    const result = await useCase.execute({ taxId: '30-12345678-9', limit: 5, offset: 10 });

    expect(result.total).toBe(11);
    expect(result.limit).toBe(5);
    expect(result.offset).toBe(10);
  });
});
