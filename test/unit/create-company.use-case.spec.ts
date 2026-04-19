import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreateCompanyUseCase } from '../../src/application/use-cases/create-company.use-case';
import { Company, CompanyType } from '../../src/domain/entities/company.entity';
import { CompanyRepository } from '../../src/domain/ports/company-repository.port';

describe('CreateCompanyUseCase', () => {
  const makeRepository = (): CompanyRepository => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    findByTaxId: jest.fn(async () => null),
    findByRegistrationDateRange: jest.fn(),
    findByType: jest.fn(),
    findByTypeAndCountry: jest.fn(),
    save: jest.fn(async (company: Company) => company),
    update: jest.fn(),
    delete: jest.fn(),
  });

  it('creates a company when taxId is not registered', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    const result = await useCase.execute({
      taxId: '30-12345678-9',
      name: 'Acme SA',
      type: CompanyType.PYME,
      country: 'AR',
    });

    expect(repository.findByTaxId).toHaveBeenCalledWith('30-12345678-9');
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.taxId).toBe('30-12345678-9');
    expect(result.name).toBe('Acme SA');
    expect(result.type).toBe(CompanyType.PYME);
    expect(result.country).toBe('AR');
    expect(result.id).toBeDefined();
  });

  it('throws ConflictException when taxId already exists', async () => {
    const existingCompany = new Company(
      'company-1',
      '30-12345678-9',
      'Existing Co',
      CompanyType.CORPORATIVA,
      new Date('2026-04-01T00:00:00.000Z'),
      'AR',
    );

    const repository = makeRepository();
    repository.findByTaxId = jest.fn(async () => existingCompany);

    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute({
        taxId: '30-12345678-9',
        name: 'New Co',
        type: CompanyType.PYME,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('defaults country to AR when not provided', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    const result = await useCase.execute({
      taxId: '30-87654321-0',
      name: 'No Country Co',
      type: CompanyType.CORPORATIVA,
    });

    expect(result.country).toBe('AR');
  });

  it('throws BadRequestException for invalid taxId format', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute({
        taxId: '30123456789',
        name: 'Invalid TaxId Co',
        type: CompanyType.PYME,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when taxId is missing', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute({
        taxId: '' as string,
        name: 'Missing TaxId Co',
        type: CompanyType.PYME,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when name is blank', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute({
        taxId: '30-87654321-0',
        name: '   ',
        type: CompanyType.PYME,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when country is blank', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute({
        taxId: '30-87654321-0',
        name: 'Invalid Country Co',
        type: CompanyType.PYME,
        country: ' ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for unsupported company type', async () => {
    const repository = makeRepository();
    const useCase = new CreateCompanyUseCase(repository);

    await expect(
      useCase.execute({
        taxId: '30-87654321-0',
        name: 'Invalid Type Co',
        type: 'SMB' as CompanyType,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
