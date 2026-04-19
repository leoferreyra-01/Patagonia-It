import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { handler } from '../../lambda/create-company.handler';

describe('create-company Lambda handler', () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-lambda-create-'));
    process.env.DATA_DIR = dataDir;

    await fs.writeFile(path.join(dataDir, 'companies.json'), JSON.stringify([], null, 2), 'utf-8');
  });

  afterEach(async () => {
    delete process.env.DATA_DIR;
    await fs.rm(dataDir, { recursive: true, force: true });
  });

  it('returns 201 and creates a company', async () => {
    const response = await handler({
      body: JSON.stringify({
        taxId: '30-12345678-9',
        name: 'Lambda Co',
        type: 'PYME',
        country: 'AR',
      }),
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body) as {
      id: string;
      taxId: string;
      name: string;
      type: string;
      country: string;
      registrationDate: string;
    };
    expect(body.taxId).toBe('30-12345678-9');
    expect(body.name).toBe('Lambda Co');
    expect(body.type).toBe('PYME');
    expect(body.country).toBe('AR');
    expect(body.id).toBeDefined();

    const companiesRaw = await fs.readFile(path.join(dataDir, 'companies.json'), 'utf-8');
    const companies = JSON.parse(companiesRaw) as Array<{ taxId: string }>;
    expect(companies.some((company) => company.taxId === '30-12345678-9')).toBe(true);
  });

  it('returns 409 when taxId already exists', async () => {
    await fs.writeFile(
      path.join(dataDir, 'companies.json'),
      JSON.stringify(
        [
          {
            id: 'existing',
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

    const response = await handler({
      body: JSON.stringify({
        taxId: '30-12345678-9',
        name: 'Duplicate Co',
        type: 'CORPORATIVA',
      }),
    });

    expect(response.statusCode).toBe(409);
    expect(response.body).toContain('already exists');
  });

  it('returns 400 when body is missing', async () => {
    const response = await handler({ body: null });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Request body is required');
  });

  it('returns 400 when body is invalid JSON', async () => {
    const response = await handler({ body: '{invalid-json}' });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Request body must be valid JSON');
  });

  it('returns 400 when taxId format is invalid', async () => {
    const response = await handler({
      body: JSON.stringify({
        taxId: 'bad-tax-id',
        name: 'Invalid TaxId Co',
        type: 'PYME',
      }),
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('taxId format must be NN-NNNNNNNN-N');
  });

  it('returns 500 with deterministic code when persisted data is invalid', async () => {
    await fs.writeFile(path.join(dataDir, 'companies.json'), '{bad-json}', 'utf-8');

    const response = await handler({
      body: JSON.stringify({
        taxId: '30-99999999-7',
        name: 'Broken Storage Co',
        type: 'PYME',
      }),
    });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      code: 'PERSISTED_DATA_INVALID',
      message: 'Persisted data is invalid',
      statusCode: 500,
    });
  });
});
