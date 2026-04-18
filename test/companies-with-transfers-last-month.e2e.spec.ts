import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CompaniesController (e2e)', () => {
  let app: INestApplication;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await fs.mkdtemp(path.join(require('node:os').tmpdir(), 'patagonia-e2e-'));
    process.env.DATA_DIR = dataDir;

    const companiesPath = path.join(dataDir, 'companies.json');
    const transfersPath = path.join(dataDir, 'transfers.json');

    const now = new Date();
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 10);

    const fortyDaysAgo = new Date(now);
    fortyDaysAgo.setDate(now.getDate() - 40);

    await fs.writeFile(
      companiesPath,
      JSON.stringify(
        [
          {
            id: 'company-1',
            taxId: '30-11111111-1',
            name: 'Company One',
            type: 'PYME',
            registrationDate: now.toISOString(),
            country: 'AR',
          },
          {
            id: 'company-2',
            taxId: '30-22222222-2',
            name: 'Company Two',
            type: 'CORPORATIVA',
            registrationDate: now.toISOString(),
            country: 'AR',
          },
        ],
        null,
        2,
      ),
      'utf-8',
    );

    await fs.writeFile(
      transfersPath,
      JSON.stringify(
        [
          {
            id: 'transfer-1',
            amount: 1500,
            companyId: 'company-1',
            date: tenDaysAgo.toISOString(),
            status: 'COMPLETED',
          },
          {
            id: 'transfer-2',
            amount: 3200,
            companyId: 'company-2',
            date: fortyDaysAgo.toISOString(),
            status: 'COMPLETED',
          },
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.DATA_DIR;
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('GET /api/companies/with-transfers/last-month returns only companies with last month transfers', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/companies/with-transfers/last-month',
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      id: 'company-1',
      taxId: '30-11111111-1',
      name: 'Company One',
      transfersInLastMonth: 1,
      totalTransferredAmountLastMonth: 1500,
    });
  });
});
