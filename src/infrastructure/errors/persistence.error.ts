import { ERROR_CATALOG } from '../../domain/errors/error-codes';

type PersistenceCatalogKey =
  | 'PERSISTENCE_READ_FAILED'
  | 'PERSISTENCE_WRITE_FAILED'
  | 'PERSISTED_DATA_INVALID';

export class PersistenceError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;
  readonly cause?: unknown;

  private constructor(catalogKey: PersistenceCatalogKey, cause?: unknown) {
    const entry = ERROR_CATALOG[catalogKey];
    super(entry.message);
    this.name = 'PersistenceError';
    this.code = entry.code;
    this.statusCode = entry.status;
    this.retryable = entry.retryable ?? false;
    this.cause = cause;
  }

  static read(filePath: string, cause?: unknown): PersistenceError {
    return new PersistenceError(
      'PERSISTENCE_READ_FAILED',
      PersistenceError.attachContext(filePath, cause),
    );
  }

  static write(filePath: string, cause?: unknown): PersistenceError {
    return new PersistenceError(
      'PERSISTENCE_WRITE_FAILED',
      PersistenceError.attachContext(filePath, cause),
    );
  }

  static invalidData(filePath: string, cause?: unknown): PersistenceError {
    return new PersistenceError(
      'PERSISTED_DATA_INVALID',
      PersistenceError.attachContext(filePath, cause),
    );
  }

  private static attachContext(filePath: string, cause?: unknown): unknown {
    return {
      filePath,
      cause,
    };
  }
}