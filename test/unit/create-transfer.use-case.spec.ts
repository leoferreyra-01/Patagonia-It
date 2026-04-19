import { BadRequestException } from '@nestjs/common';
import {
  CreateTransferUseCase,
} from '../../src/application/use-cases/create-transfer.use-case';
import { Company, CompanyType } from '../../src/domain/entities/company.entity';
import { TransferStatus } from '../../src/domain/entities/transfer.entity';
import { CompanyRepository } from '../../src/domain/ports/company-repository.port';
import { TransferRepository } from '../../src/domain/ports/transfer-repository.port';

describe('CreateTransferUseCase', () => {
  const existingCompany = new Company(
    'company-1',
    '30-12345678-9',
    'Acme SA',
    CompanyType.PYME,
    new Date('2026-04-01T00:00:00.000Z'),
    'AR',
  );

  const makeRepository = (): TransferRepository => ({
    save: jest.fn(async (transfer) => transfer),
    findByCompanyId: jest.fn(),
    findByDateRange: jest.fn(),
    findByCompanyIdAndDateRange: jest.fn(),
  });

  const makeCompanyRepository = (): CompanyRepository => ({
    findAll: jest.fn(),
    findById: jest.fn(async () => existingCompany),
    findByTaxId: jest.fn(),
    findByRegistrationDateRange: jest.fn(),
    findByType: jest.fn(),
    findByTypeAndCountry: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  it('creates a transfer with default status PENDING', async () => {
    const repository = makeRepository();
    const companyRepository = makeCompanyRepository();
    const useCase = new CreateTransferUseCase(repository, companyRepository);

    const result = await useCase.execute({
      amount: 1500,
      companyId: 'company-1',
    });

    expect(result.amount).toBe(1500);
    expect(result.companyId).toBe('company-1');
    expect(result.status).toBe(TransferStatus.PENDING);
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(companyRepository.findById).toHaveBeenCalledWith('company-1');
  });

  it('creates a transfer with explicit status', async () => {
    const repository = makeRepository();
    const companyRepository = makeCompanyRepository();
    const useCase = new CreateTransferUseCase(repository, companyRepository);

    const result = await useCase.execute({
      amount: 500,
      companyId: 'company-1',
      status: TransferStatus.FAILED,
    });

    expect(result.status).toBe(TransferStatus.FAILED);
  });

  it('throws BadRequestException for invalid amount', async () => {
    const repository = makeRepository();
    const companyRepository = makeCompanyRepository();
    const useCase = new CreateTransferUseCase(repository, companyRepository);

    await expect(
      useCase.execute({
        amount: 0,
        companyId: 'company-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when companyId is blank', async () => {
    const repository = makeRepository();
    const companyRepository = makeCompanyRepository();
    const useCase = new CreateTransferUseCase(repository, companyRepository);

    await expect(
      useCase.execute({
        amount: 10,
        companyId: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when company does not exist', async () => {
    const repository = makeRepository();
    const companyRepository = makeCompanyRepository();
    companyRepository.findById = jest.fn(async () => null);
    const useCase = new CreateTransferUseCase(repository, companyRepository);

    await expect(
      useCase.execute({
        amount: 1500,
        companyId: 'unknown-company',
      }),
    ).rejects.toMatchObject({
      status: 404,
      response: {
        code: 'COMPANY_ID_NOT_FOUND',
        message: 'Company with id unknown-company not found',
        statusCode: 404,
      },
    });
  });
});