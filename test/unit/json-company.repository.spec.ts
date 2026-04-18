import { NotFoundException } from '@nestjs/common';
import {
  Company,
  CompanyType,
} from '../../src/domain/entities/company.entity';
import { FileStorage } from '../../src/infrastructure/persistence/file-storage';
import { JsonCompanyRepository } from '../../src/infrastructure/persistence/json-company.repository';

describe('JsonCompanyRepository', () => {
  let storage: jest.Mocked<FileStorage>;
  let repository: JsonCompanyRepository;

  const companyRecord = {
    id: 'company-1',
    taxId: '30-12345678-9',
    name: 'Acme SA',
    type: CompanyType.CORPORATIVA,
    registrationDate: '2026-04-01T00:00:00.000Z',
    country: 'AR',
  };

  beforeEach(() => {
    storage = {
      readArray: jest.fn(),
      writeArray: jest.fn(),
    } as unknown as jest.Mocked<FileStorage>;

    repository = new JsonCompanyRepository(storage);
  });

  it('findAll maps records to Company entities', async () => {
    storage.readArray.mockResolvedValue([companyRecord]);

    const result = await repository.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Company);
    expect(result[0]).toMatchObject({
      id: 'company-1',
      taxId: '30-12345678-9',
      name: 'Acme SA',
    });
  });

  it('findById returns null when company is missing', async () => {
    storage.readArray.mockResolvedValue([companyRecord]);

    const result = await repository.findById('missing-id');

    expect(result).toBeNull();
  });

  it('findByTaxId returns company when found', async () => {
    storage.readArray.mockResolvedValue([companyRecord]);

    const result = await repository.findByTaxId('30-12345678-9');

    expect(result?.id).toBe('company-1');
  });

  it('findByRegistrationDateRange filters by date range', async () => {
    storage.readArray.mockResolvedValue([
      companyRecord,
      {
        ...companyRecord,
        id: 'company-2',
        taxId: '30-55555555-5',
        registrationDate: '2026-02-01T00:00:00.000Z',
      },
    ]);

    const result = await repository.findByRegistrationDateRange(
      new Date('2026-03-15T00:00:00.000Z'),
      new Date('2026-04-30T00:00:00.000Z'),
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('company-1');
  });

  it('save appends and persists new company', async () => {
    storage.readArray.mockResolvedValue([companyRecord]);

    const newCompany = new Company(
      'company-3',
      '30-77777777-7',
      'New Co',
      CompanyType.PYME,
      new Date('2026-04-03T00:00:00.000Z'),
      'AR',
    );

    await repository.save(newCompany);

    expect(storage.writeArray).toHaveBeenCalledTimes(1);
    const persisted = storage.writeArray.mock.calls[0][1] as Array<{ id: string }>;
    expect(persisted).toHaveLength(2);
    expect(persisted[1].id).toBe('company-3');
  });

  it('update throws when company does not exist', async () => {
    storage.readArray.mockResolvedValue([companyRecord]);

    const missing = new Company(
      'company-missing',
      '30-00000000-0',
      'Missing Co',
      CompanyType.PYME,
      new Date('2026-04-03T00:00:00.000Z'),
      'AR',
    );

    await expect(repository.update(missing)).rejects.toThrow(NotFoundException);
  });

  it('update replaces existing company', async () => {
    storage.readArray.mockResolvedValue([companyRecord]);

    const updated = new Company(
      'company-1',
      '30-12345678-9',
      'Acme Updated',
      CompanyType.CORPORATIVA,
      new Date('2026-04-01T00:00:00.000Z'),
      'AR',
    );

    await repository.update(updated);

    expect(storage.writeArray).toHaveBeenCalledTimes(1);
    const persisted = storage.writeArray.mock.calls[0][1] as Array<{ name: string }>;
    expect(persisted[0].name).toBe('Acme Updated');
  });

  it('delete removes company by id', async () => {
    storage.readArray.mockResolvedValue([
      companyRecord,
      {
        ...companyRecord,
        id: 'company-2',
        taxId: '30-22222222-2',
      },
    ]);

    await repository.delete('company-1');

    expect(storage.writeArray).toHaveBeenCalledTimes(1);
    const persisted = storage.writeArray.mock.calls[0][1] as Array<{ id: string }>;
    expect(persisted).toHaveLength(1);
    expect(persisted[0].id).toBe('company-2');
  });
});
