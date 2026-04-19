import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/infrastructure/http/filters/global-exception.filter';

describe('GET /api/transfers (e2e)', () => {
  let app: INestApplication;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-e2e-list-transfers-'));
    process.env.DATA_DIR = dataDir;

    await fs.writeFile(
      path.join(dataDir, 'companies.json'),
      JSON.stringify(
        [
          {
            id: 'company-1',
            taxId: '30-12345678-9',
            name: 'Acme SA',
            type: 'PYME',
            registrationDate: new Date('2026-04-01T00:00:00.000Z').toISOString(),
            country: 'AR',
          },
          {
            id: 'company-2',
            taxId: '30-87654321-0',
            name: 'Other SA',
            type: 'CORPORATIVA',
            registrationDate: new Date('2026-04-02T00:00:00.000Z').toISOString(),
            country: 'AR',
          },
        ],
        null,
        2,
      ),
      'utf-8',
    );

    await fs.writeFile(
      path.join(dataDir, 'transfers.json'),
      JSON.stringify(
        [
          { id: 't-1', amount: 1000, companyId: 'company-1', date: '2026-04-10T00:00:00.000Z', status: 'COMPLETED' },
          { id: 't-2', amount: 500, companyId: 'company-1', date: '2026-04-11T00:00:00.000Z', status: 'PENDING' },
          { id: 't-3', amount: 200, companyId: 'company-1', date: '2026-04-12T00:00:00.000Z', status: 'COMPLETED' },
          { id: 't-4', amount: 800, companyId: 'company-2', date: '2026-04-13T00:00:00.000Z', status: 'COMPLETED' },
        ],
        null,
        2,
      ),
      'utf-8',
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (validationErrors) =>
          new BadRequestException({
            code: 'VALIDATION_ERROR',
            message: validationErrors.flatMap((error) =>
              Object.values(error.constraints ?? {}),
            ),
            statusCode: 400,
          }),
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.DATA_DIR;
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('returns all transfers for a valid taxId', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers')
      .query({ taxId: '30-12345678-9' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.items).toHaveLength(3);
    expect(response.body.limit).toBe(10);
    expect(response.body.offset).toBe(0);
  });

  it('filters by status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers')
      .query({ taxId: '30-12345678-9', status: 'COMPLETED' });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items.every((t: { status: string }) => t.status === 'COMPLETED')).toBe(true);
  });

  it('respects limit and offset pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers')
      .query({ taxId: '30-12345678-9', limit: 2, offset: 0 });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.limit).toBe(2);
    expect(response.body.offset).toBe(0);
  });

  it('returns empty items when offset exceeds total', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers')
      .query({ taxId: '30-12345678-9', limit: 10, offset: 100 });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(3);
    expect(response.body.items).toHaveLength(0);
  });

  it('returns 404 when taxId does not match any company', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers')
      .query({ taxId: '30-00000000-0' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 'COMPANY_TAX_ID_NOT_FOUND',
      message: 'Company with taxId 30-00000000-0 not found',
      statusCode: 404,
    });
  });

  it('returns 400 when taxId is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers');

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when status is invalid', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/transfers')
      .query({ taxId: '30-12345678-9', status: 'UNKNOWN' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
