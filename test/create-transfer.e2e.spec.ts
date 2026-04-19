import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('POST /api/transfers (e2e)', () => {
  let app: INestApplication;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-e2e-create-transfer-'));
    process.env.DATA_DIR = dataDir;

    await fs.writeFile(
      path.join(dataDir, 'companies.json'),
      JSON.stringify(
        [
          {
            id: 'company-1',
            taxId: '30-12345678-9',
            name: 'Existing Co 1',
            type: 'PYME',
            registrationDate: new Date('2026-04-01T00:00:00.000Z').toISOString(),
            country: 'AR',
          },
          {
            id: 'company-2',
            taxId: '30-87654321-0',
            name: 'Existing Co 2',
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
      JSON.stringify([], null, 2),
      'utf-8',
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.DATA_DIR;
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('creates a transfer with default status PENDING and returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/transfers')
      .send({
        amount: 1000,
        companyId: 'company-1',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      amount: 1000,
      companyId: 'company-1',
      status: 'PENDING',
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.date).toBeDefined();

    const transfersRaw = await fs.readFile(path.join(dataDir, 'transfers.json'), 'utf-8');
    const transfers = JSON.parse(transfersRaw) as Array<{ companyId: string; status: string }>;
    expect(
      transfers.some(
        (transfer) => transfer.companyId === 'company-1' && transfer.status === 'PENDING',
      ),
    ).toBe(true);
  });

  it('creates a transfer with explicit status', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/transfers')
      .send({
        amount: 450,
        companyId: 'company-2',
        status: 'FAILED',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('FAILED');
  });

  it('returns 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/transfers')
      .send({
        amount: 0,
        companyId: '',
      });

    expect(response.status).toBe(400);
  });

  it('returns 404 when companyId does not exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/transfers')
      .send({
        amount: 100,
        companyId: 'company-missing',
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 'COMPANY_ID_NOT_FOUND',
      message: 'Company with id company-missing not found',
      statusCode: 404,
    });
  });
});