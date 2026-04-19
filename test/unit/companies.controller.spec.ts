import { CompaniesController } from '../../src/infrastructure/http/controllers/companies.controller';
import { Company, CompanyType } from '../../src/domain/entities/company.entity';

describe('CompaniesController', () => {
  const getCompaniesWithTransfersLastMonthUseCase = {
    execute: jest.fn(),
  };
  const getJoinedLastMonthUseCase = {
    execute: jest.fn(),
  };
  const createCompanyUseCase = {
    execute: jest.fn(),
  };
  const listCompaniesUseCase = {
    execute: jest.fn(),
  };

  const controller = new CompaniesController(
    getCompaniesWithTransfersLastMonthUseCase as any,
    getJoinedLastMonthUseCase as any,
    createCompanyUseCase as any,
    listCompaniesUseCase as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps listCompanies result to response DTO shape', async () => {
    const company = new Company(
      'company-1',
      '30-12345678-9',
      'Acme SA',
      CompanyType.PYME,
      new Date('2026-04-01T00:00:00.000Z'),
      'AR',
    );

    listCompaniesUseCase.execute.mockResolvedValue({
      items: [company],
      total: 1,
      limit: 10,
      offset: 0,
    });

    const result = await controller.listCompanies({
      type: CompanyType.PYME,
      country: 'AR',
      limit: 10,
      offset: 0,
    });

    expect(listCompaniesUseCase.execute).toHaveBeenCalledWith({
      type: CompanyType.PYME,
      country: 'AR',
      limit: 10,
      offset: 0,
    });

    expect(result).toEqual({
      total: 1,
      limit: 10,
      offset: 0,
      items: [
        {
          id: 'company-1',
          taxId: '30-12345678-9',
          name: 'Acme SA',
          type: CompanyType.PYME,
          country: 'AR',
          registrationDate: '2026-04-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('applies default limit and offset when query values are missing', async () => {
    listCompaniesUseCase.execute.mockResolvedValue({
      items: [],
      total: 0,
      limit: 10,
      offset: 0,
    });

    await controller.listCompanies({
      country: 'AR',
    });

    expect(listCompaniesUseCase.execute).toHaveBeenCalledWith({
      type: undefined,
      country: 'AR',
      limit: 10,
      offset: 0,
    });
  });
});
