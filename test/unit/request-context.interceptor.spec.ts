import { ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { RequestContextInterceptor } from '../../src/infrastructure/http/interceptors/request-context.interceptor';
import { StructuredLoggerService } from '../../src/infrastructure/logging/structured-logger.service';

describe('RequestContextInterceptor', () => {
  let logger: jest.Mocked<StructuredLoggerService>;
  let interceptor: RequestContextInterceptor;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<StructuredLoggerService>;

    interceptor = new RequestContextInterceptor(logger);
  });

  it('returns next handler directly for non-http contexts', (done) => {
    const next = { handle: jest.fn(() => of('ok')) };
    const context = {
      getType: () => 'rpc',
    } as ExecutionContext;

    interceptor.intercept(context, next).subscribe((value) => {
      expect(value).toBe('ok');
      expect(next.handle).toHaveBeenCalledTimes(1);
      expect(logger.log).not.toHaveBeenCalled();
      done();
    });
  });

  it('generates correlation id, sets header and logs lifecycle for http requests', (done) => {
    const setHeader = jest.fn();
    const request = {
      method: 'GET',
      url: '/api/health',
      headers: {},
    };
    const response = {
      statusCode: 200,
      setHeader,
    };
    const next = { handle: jest.fn(() => of('ok')) };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    interceptor.intercept(context, next).subscribe((value) => {
      expect(value).toBe('ok');
      expect(setHeader).toHaveBeenCalledWith(
        'x-correlation-id',
        expect.any(String),
      );
      expect(request).toHaveProperty('correlationId');
      expect(logger.log).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('reuses first correlation id when header value is an array', (done) => {
    const setHeader = jest.fn();
    const request = {
      method: 'GET',
      url: '/api/health',
      headers: {
        'x-correlation-id': ['provided-id', 'other-id'],
      },
    };
    const response = {
      statusCode: 200,
      setHeader,
    };
    const next = { handle: jest.fn(() => of('ok')) };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    interceptor.intercept(context, next).subscribe(() => {
      expect(setHeader).toHaveBeenCalledWith('x-correlation-id', 'provided-id');
      done();
    });
  });

  it('logs and rethrows errors from downstream handler', (done) => {
    const setHeader = jest.fn();
    const request = {
      method: 'POST',
      url: '/api/companies',
      headers: {
        'x-correlation-id': 'provided-id',
      },
    };
    const response = {
      statusCode: 400,
      setHeader,
    };
    const next = {
      handle: jest.fn(() => throwError(() => new Error('boom'))),
    };
    const context = {
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    interceptor.intercept(context, next).subscribe({
      next: () => done.fail('expected error'),
      error: (error) => {
        expect(error.message).toBe('boom');
        expect(logger.error).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});