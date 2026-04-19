import { HealthReadinessService } from '../../src/infrastructure/http/services/health-readiness.service';
import { PersistenceError } from '../../src/infrastructure/errors/persistence.error';

describe('HealthReadinessService', () => {
  it('checks persistence by reading and writing readiness probe file', async () => {
    const storage = {
      readArray: jest.fn(async () => []),
      writeArray: jest.fn(async () => undefined),
    };

    const service = new HealthReadinessService(storage as never);

    await expect(service.checkPersistence()).resolves.toBeUndefined();
    expect(storage.readArray).toHaveBeenCalledWith('__health/readiness-probe.json');
    expect(storage.writeArray).toHaveBeenCalledWith('__health/readiness-probe.json', []);
  });

  it('propagates persistence errors when probe cannot be written', async () => {
    const storage = {
      readArray: jest.fn(async () => []),
      writeArray: jest.fn(async () => {
        throw PersistenceError.write('__health/readiness-probe.json');
      }),
    };

    const service = new HealthReadinessService(storage as never);

    await expect(service.checkPersistence()).rejects.toMatchObject({
      code: 'PERSISTENCE_WRITE_FAILED',
      statusCode: 503,
      retryable: true,
    });
  });
});