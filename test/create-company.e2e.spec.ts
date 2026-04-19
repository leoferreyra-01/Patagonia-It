import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('POST /api/companies (e2e)', () => {
  let app: INestApplication;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-e2e-create-company-'));
    process.env.DATA_DIR = dataDir;

    await fs.writeFile(
      path.join(dataDir, 'companies.json'),
      JSON.stringify(
        [
          {
            id: 'company-1',
            taxId: '30-12345678-9',
            name: 'Existing Co',
            type: 'PYME',
            registrationDate: new Date('2026-04-01T00:00:00.000Z').toISOString(),
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

  it('creates a new company and returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/companies')
      .send({
        taxId: '30-87654321-0',
        name: 'New Co',
        type: 'CORPORATIVA',
        country: 'UY',
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      taxId: '30-87654321-0',
      name: 'New Co',
      type: 'CORPORATIVA',
      country: 'UY',
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.registrationDate).toBeDefined();

    const companiesRaw = await fs.readFile(path.join(dataDir, 'companies.json'), 'utf-8');
    const companies = JSON.parse(companiesRaw) as Array<{ taxId: string }>;
    expect(companies.some((company) => company.taxId === '30-87654321-0')).toBe(true);
  });

  it('returns 409 when taxId already exists', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/companies')
      .send({
        taxId: '30-12345678-9',
        name: 'Duplicated Co',
        type: 'PYME',
      });

    expect(response.status).toBe(409);
  });

  it('returns 400 when payload is invalid', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/companies')
      .send({
        taxId: 'bad-tax-id',
        name: '',
        type: 'PYME',
      });

    expect(response.status).toBe(400);
  });
});
