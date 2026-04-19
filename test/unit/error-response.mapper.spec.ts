import {
  BadRequestException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { ERROR_CATALOG } from '../../src/domain/errors/error-codes';
import { PersistenceError } from '../../src/infrastructure/errors/persistence.error';
import { mapErrorToResponse } from '../../src/infrastructure/http/utils/error-response.mapper';

describe('mapErrorToResponse', () => {
  it('returns explicit code when exception response already contains it', () => {
    const error = new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: ['taxId format must be NN-NNNNNNNN-N'],
      statusCode: 400,
    });

    expect(mapErrorToResponse(error)).toEqual({
      code: 'VALIDATION_ERROR',
      message: ['taxId format must be NN-NNNNNNNN-N'],
      statusCode: 400,
    });
  });

  it('infers code from catalog message when response object has no code', () => {
    const error = new BadRequestException(
      ERROR_CATALOG.INVALID_TAX_ID_FORMAT.message,
    );

    expect(mapErrorToResponse(error)).toEqual({
      code: ERROR_CATALOG.INVALID_TAX_ID_FORMAT.code,
      message: ERROR_CATALOG.INVALID_TAX_ID_FORMAT.message,
      statusCode: 400,
    });
  });

  it('maps duplicate company conflict from dynamic message', () => {
    const error = new ConflictException(
      'Company with taxId 30-12345678-9 already exists',
    );

    expect(mapErrorToResponse(error)).toEqual({
      code: ERROR_CATALOG.COMPANY_TAX_ID_ALREADY_EXISTS.code,
      message: 'Company with taxId 30-12345678-9 already exists',
      statusCode: 409,
    });
  });

  it('falls back to BAD_REQUEST for unmatched 400 messages', () => {
    const error = new BadRequestException('Unexpected client error');

    expect(mapErrorToResponse(error)).toEqual({
      code: 'BAD_REQUEST',
      message: 'Unexpected client error',
      statusCode: 400,
    });
  });

  it('falls back to CONFLICT for unmatched 409 messages', () => {
    const error = new ConflictException('Other conflict');

    expect(mapErrorToResponse(error)).toEqual({
      code: 'CONFLICT',
      message: 'Other conflict',
      statusCode: 409,
    });
  });

  it('falls back to INTERNAL_SERVER_ERROR for unmatched >=500 http exceptions', () => {
    const error = new HttpException('Upstream exploded', 502);

    expect(mapErrorToResponse(error)).toEqual({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Upstream exploded',
      statusCode: 502,
    });
  });

  it('maps retryable persistence read errors to a deterministic 503 response', () => {
    const error = PersistenceError.read('companies.json', new Error('disk unavailable'));

    expect(mapErrorToResponse(error)).toEqual({
      code: ERROR_CATALOG.PERSISTENCE_READ_FAILED.code,
      message: ERROR_CATALOG.PERSISTENCE_READ_FAILED.message,
      statusCode: ERROR_CATALOG.PERSISTENCE_READ_FAILED.status,
    });
  });

  it('maps invalid persisted data errors to a deterministic 500 response', () => {
    const error = PersistenceError.invalidData('companies.json');

    expect(mapErrorToResponse(error)).toEqual({
      code: ERROR_CATALOG.PERSISTED_DATA_INVALID.code,
      message: ERROR_CATALOG.PERSISTED_DATA_INVALID.message,
      statusCode: ERROR_CATALOG.PERSISTED_DATA_INVALID.status,
    });
  });

  it('returns unexpected create company fallback for non-http errors', () => {
    expect(mapErrorToResponse(new Error('boom'))).toEqual({
      code: ERROR_CATALOG.UNEXPECTED_CREATE_COMPANY_ERROR.code,
      message: ERROR_CATALOG.UNEXPECTED_CREATE_COMPANY_ERROR.message,
      statusCode: 500,
    });
  });
});