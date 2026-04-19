import { Test, TestingModule } from '@nestjs/testing';
import { ListCompaniesUseCase } from '../../src/application/use-cases/list-companies.use-case';
import { COMPANY_REPOSITORY } from '../../src/domain/ports/company-repository.port';
import { Company, CompanyType } from '../../src/domain/entities/company.entity';

describe('ListCompaniesUseCase', () => {
  let useCase: ListCompaniesUseCase;

  const mockCompanies: Company[] = [
    Company.create('10-12345678-9', 'Company 1', CompanyType.PYME, 'AR'),
    Company.create('20-87654321-9', 'Company 2', CompanyType.CORPORATIVA, 'AR'),
    Company.create('30-11111111-9', 'Company 3', CompanyType.PYME, 'BR'),
    Company.create('40-22222222-9', 'Company 4', CompanyType.PYME, 'AR'),
  ];

  const mockRepository = {
    findAll: jest.fn().mockResolvedValue(mockCompanies),
    findById: jest.fn(),
    findByTaxId: jest.fn(),
    findByRegistrationDateRange: jest.fn(),
    findByType: jest.fn(),
    findByTypeAndCountry: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCompaniesUseCase,
        {
          provide: COMPANY_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListCompaniesUseCase>(ListCompaniesUseCase);
    jest.clearAllMocks();
  });

  it('should list all companies without filters', async () => {
    mockRepository.findAll.mockResolvedValue(mockCompanies);

    const result = await useCase.execute({
      limit: 10,
      offset: 0,
    });

    expect(result.items).toHaveLength(4);
    expect(result.total).toBe(4);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(0);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });

  it('should apply pagination correctly', async () => {
    mockRepository.findAll.mockResolvedValue(mockCompanies);

    const result = await useCase.execute({
      limit: 2,
      offset: 1,
    });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(4);
    expect(result.limit).toBe(2);
    expect(result.offset).toBe(1);
  });

  it('should filter companies by type', async () => {
    const pymeCompanies = mockCompanies.filter(
      (c) => c.type === CompanyType.PYME,
    );
    mockRepository.findByType.mockResolvedValue({
      items: pymeCompanies,
      total: pymeCompanies.length,
    });

    const result = await useCase.execute({
      type: CompanyType.PYME,
      limit: 10,
      offset: 0,
    });

    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(mockRepository.findByType).toHaveBeenCalledWith(
      CompanyType.PYME,
      { limit: 10, offset: 0 },
    );
  });

  it('should filter companies by type and country', async () => {
    const filtered = mockCompanies.filter(
      (c) => c.type === CompanyType.PYME && c.country === 'AR',
    );
    mockRepository.findByTypeAndCountry.mockResolvedValue({
      items: filtered,
      total: filtered.length,
    });

    const result = await useCase.execute({
      type: CompanyType.PYME,
      country: 'AR',
      limit: 10,
      offset: 0,
    });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(mockRepository.findByTypeAndCountry).toHaveBeenCalledWith(
      CompanyType.PYME,
      'AR',
      { limit: 10, offset: 0 },
    );
  });
});
