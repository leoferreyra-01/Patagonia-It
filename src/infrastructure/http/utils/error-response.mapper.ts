import {
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ERROR_CATALOG } from '../../../domain/errors/error-codes';
import { PersistenceError } from '../../errors/persistence.error';

export type StandardErrorResponse = {
  code: string;
  message: string | string[];
  statusCode: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const inferCodeFromMessage = (
  message: string | string[],
  statusCode: number,
): string => {
  const primaryMessage = Array.isArray(message) ? message[0] : message;

  for (const entry of Object.values(ERROR_CATALOG)) {
    if (entry.status === statusCode && entry.message === primaryMessage) {
      return entry.code;
    }
  }

  if (
    statusCode === ERROR_CATALOG.COMPANY_TAX_ID_ALREADY_EXISTS.status
    && typeof primaryMessage === 'string'
    && primaryMessage.startsWith('Company with taxId ')
    && primaryMessage.endsWith(' already exists')
  ) {
    return ERROR_CATALOG.COMPANY_TAX_ID_ALREADY_EXISTS.code;
  }

  if (statusCode === 400) {
    return 'BAD_REQUEST';
  }

  if (statusCode === 409) {
    return 'CONFLICT';
  }

  if (statusCode >= 500) {
    return 'INTERNAL_SERVER_ERROR';
  }

  return 'UNEXPECTED_ERROR';
};

export const mapErrorToResponse = (error: unknown): StandardErrorResponse => {
  if (error instanceof PersistenceError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof HttpException) {
    const statusCode = error.getStatus();
    const exceptionResponse = error.getResponse();

    if (isRecord(exceptionResponse)) {
      const message =
        typeof exceptionResponse.message === 'string'
        || Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : error.message;

      const code =
        typeof exceptionResponse.code === 'string'
          ? exceptionResponse.code
          : inferCodeFromMessage(message, statusCode);

      return {
        code,
        message,
        statusCode,
      };
    }

    const message =
      typeof exceptionResponse === 'string' ? exceptionResponse : error.message;

    return {
      code: inferCodeFromMessage(message, statusCode),
      message,
      statusCode,
    };
  }

  const fallback = new InternalServerErrorException(
    ERROR_CATALOG.UNEXPECTED_CREATE_COMPANY_ERROR.message,
  );

  return {
    code: ERROR_CATALOG.UNEXPECTED_CREATE_COMPANY_ERROR.code,
    message: fallback.message,
    statusCode: fallback.getStatus(),
  };
};