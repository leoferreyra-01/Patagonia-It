import { ServiceUnavailableException } from '@nestjs/common';
import { ERROR_CATALOG } from '../../src/domain/errors/error-codes';
import { HealthController } from '../../src/infrastructure/http/controllers/health.controller';
import { HealthReadinessService } from '../../src/infrastructure/http/services/health-readiness.service';

describe('HealthController', () => {
  it('returns readiness response when persistence check passes', async () => {
    const readinessService = {
      checkPersistence: jest.fn(async () => undefined),
    };

    const controller = new HealthController(
      readinessService as unknown as HealthReadinessService,
    );

    await expect(controller.getReadiness()).resolves.toEqual({
      status: 'ok',
      checks: {
        persistence: 'up',
      },
    });
  });

  it('maps readiness failures to deterministic 503 error payload', async () => {
    const readinessService = {
      checkPersistence: jest.fn(async () => {
        throw new Error('write failed');
      }),
    };

    const controller = new HealthController(
      readinessService as unknown as HealthReadinessService,
    );

    await expect(controller.getReadiness()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );

    try {
      await controller.getReadiness();
    } catch (error) {
      const response = (error as ServiceUnavailableException).getResponse() as {
        code: string;
        message: string;
        statusCode: number;
      };

      expect(response).toEqual({
        code: ERROR_CATALOG.READINESS_PERSISTENCE_CHECK_FAILED.code,
        message: ERROR_CATALOG.READINESS_PERSISTENCE_CHECK_FAILED.message,
        statusCode: ERROR_CATALOG.READINESS_PERSISTENCE_CHECK_FAILED.status,
      });
    }
  });
});