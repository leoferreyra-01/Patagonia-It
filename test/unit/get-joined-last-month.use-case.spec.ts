import { Company, CompanyType } from '../../src/domain/entities/company.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { ERROR_CATALOG } from '../../src/domain/errors/error-codes';
import { PersistenceError } from '../../src/infrastructure/errors/persistence.error';
import { CompanyRepository } from '../../src/domain/ports/company-repository.port';
import { GetJoinedLastMonthUseCase } from '../../src/application/use-cases/get-joined-last-month.use-case';

const makeCompany = (id: string, daysAgo: number): Company => {
  const date = new Date('2026-04-18T00:00:00.000Z');
  date.setDate(date.getDate() - daysAgo);
  return new Company(id, `30-${id}-0`, `Company ${id}`, CompanyType.PYME, date, 'AR');
};

const makeRepository = (companies: Company[]): CompanyRepository => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByTaxId: jest.fn(),
  findByRegistrationDateRange: jest.fn(async () => companies),
  findByType: jest.fn(),
  findByTypeAndCountry: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('GetJoinedLastMonthUseCase', () => {
  const referenceDate = new Date('2026-04-18T00:00:00.000Z');

  it('returns companies sorted by registrationDate descending', async () => {
    const older = makeCompany('older', 20);
    const newer = makeCompany('newer', 5);
    const repo = makeRepository([older, newer]);

    const result = await new GetJoinedLastMonthUseCase(repo).execute(referenceDate);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('newer');
    expect(result[1].id).toBe('older');
  });

  it('passes correct date range to repository (startDate = today - 30, endDate = today)', async () => {
    const repo = makeRepository([]);
    await new GetJoinedLastMonthUseCase(repo).execute(referenceDate);

    const expectedStart = new Date('2026-03-19T00:00:00.000Z');
    const [start, end] = (repo.findByRegistrationDateRange as jest.Mock).mock.calls[0] as [Date, Date];

    expect(start).toEqual(expectedStart);
    expect(end).toEqual(referenceDate);
  });

  it('returns empty array when no companies registered in range', async () => {
    const repo = makeRepository([]);
    const result = await new GetJoinedLastMonthUseCase(repo).execute(referenceDate);

    expect(result).toEqual([]);
  });

  it('returns single company unchanged', async () => {
    const company = makeCompany('solo', 10);
    const repo = makeRepository([company]);

    const result = await new GetJoinedLastMonthUseCase(repo).execute(referenceDate);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('solo');
  });

  it('uses current date as default reference when none is provided', async () => {
    const repo = makeRepository([]);
    await new GetJoinedLastMonthUseCase(repo).execute();

    expect(repo.findByRegistrationDateRange).toHaveBeenCalledTimes(1);
    const [start, end] = (repo.findByRegistrationDateRange as jest.Mock).mock.calls[0] as [Date, Date];
    expect(end.getTime() - start.getTime()).toBeCloseTo(30 * 24 * 60 * 60 * 1000, -3);
  });

  it('throws catalog-backed 500 when repository fails', async () => {
    const repo = makeRepository([]);
    repo.findByRegistrationDateRange = jest.fn(async () => {
      throw new Error('disk failure');
    });

    await expect(new GetJoinedLastMonthUseCase(repo).execute(referenceDate)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );

    try {
      await new GetJoinedLastMonthUseCase(repo).execute(referenceDate);
    } catch (error) {
      const response = (error as InternalServerErrorException).getResponse() as {
        code: string;
        message: string;
        statusCode: number;
      };
      expect(response).toEqual({
        code: ERROR_CATALOG.JOINED_LAST_MONTH_FETCH_FAILED.code,
        message: ERROR_CATALOG.JOINED_LAST_MONTH_FETCH_FAILED.message,
        statusCode: ERROR_CATALOG.JOINED_LAST_MONTH_FETCH_FAILED.status,
      });
    }
  });

  it('rethrows retryable persistence errors without masking their code', async () => {
    const repo = makeRepository([]);
    repo.findByRegistrationDateRange = jest.fn(async () => {
      throw PersistenceError.read('companies.json', new Error('disk unavailable'));
    });

    await expect(new GetJoinedLastMonthUseCase(repo).execute(referenceDate)).rejects.toMatchObject({
      code: ERROR_CATALOG.PERSISTENCE_READ_FAILED.code,
      message: ERROR_CATALOG.PERSISTENCE_READ_FAILED.message,
      statusCode: ERROR_CATALOG.PERSISTENCE_READ_FAILED.status,
      retryable: true,
    });
  });
});
