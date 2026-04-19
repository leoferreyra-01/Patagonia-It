import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;
  let dataDir: string;

  beforeAll(async () => {
    dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-health-e2e-'));
    process.env.DATA_DIR = dataDir;

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

  it('GET /api/health should return status ok', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      message: 'Hello from NestJS',
    });
    expect(response.headers['x-correlation-id']).toBeDefined();
  });

  it('propagates incoming x-correlation-id header', async () => {
    const correlationId = 'test-correlation-id-123';
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('x-correlation-id', correlationId);

    expect(response.status).toBe(200);
    expect(response.headers['x-correlation-id']).toBe(correlationId);
  });

  it('GET /api/health/ready should return readiness status ok', async () => {
    const response = await request(app.getHttpServer()).get('/api/health/ready');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      checks: {
        persistence: 'up',
      },
    });
    expect(response.headers['x-correlation-id']).toBeDefined();
  });
});
