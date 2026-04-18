import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GET /api/companies/joined-last-month (e2e)', () => {
  let app: INestApplication;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-e2e-joined-'));
    process.env.DATA_DIR = dataDir;

    const now = new Date('2026-04-18T00:00:00.000Z');

    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(now.getDate() - 10);

    const twentyDaysAgo = new Date(now);
    twentyDaysAgo.setDate(now.getDate() - 20);

    const fortyDaysAgo = new Date(now);
    fortyDaysAgo.setDate(now.getDate() - 40);

    await fs.writeFile(
      path.join(dataDir, 'companies.json'),
      JSON.stringify(
        [
          {
            id: 'company-recent-1',
            taxId: '30-11111111-1',
            name: 'Recent One',
            type: 'PYME',
            registrationDate: tenDaysAgo.toISOString(),
            country: 'AR',
          },
          {
            id: 'company-recent-2',
            taxId: '30-22222222-2',
            name: 'Recent Two',
            type: 'CORPORATIVA',
            registrationDate: twentyDaysAgo.toISOString(),
            country: 'AR',
          },
          {
            id: 'company-old',
            taxId: '30-33333333-3',
            name: 'Old Company',
            type: 'PYME',
            registrationDate: fortyDaysAgo.toISOString(),
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

  it('returns only companies registered in the last 30 days', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/companies/joined-last-month',
    );

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toHaveLength(2);

    const ids = response.body.items.map((c: { id: string }) => c.id);
    expect(ids).not.toContain('company-old');
    expect(ids).toContain('company-recent-1');
    expect(ids).toContain('company-recent-2');
  });

  it('returns items sorted by registrationDate descending', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/companies/joined-last-month',
    );

    expect(response.status).toBe(200);
    expect(response.body.items[0].id).toBe('company-recent-1');
    expect(response.body.items[1].id).toBe('company-recent-2');
  });

  it('returns correct item shape', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/companies/joined-last-month',
    );

    expect(response.body.items[0]).toMatchObject({
      id: 'company-recent-1',
      taxId: '30-11111111-1',
      name: 'Recent One',
      type: 'PYME',
      country: 'AR',
    });
    expect(typeof response.body.items[0].registrationDate).toBe('string');
  });
});
