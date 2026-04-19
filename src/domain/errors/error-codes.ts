export type ErrorCatalogEntry = {
  code: string;
  status: number;
  message: string;
  retryable?: boolean;
};

export const ERROR_CATALOG = {
  REQUEST_BODY_REQUIRED: {
    code: 'REQUEST_BODY_REQUIRED',
    status: 400,
    message: 'Request body is required',
  },
  INVALID_JSON_BODY: {
    code: 'INVALID_JSON_BODY',
    status: 400,
    message: 'Request body must be valid JSON',
  },
  TAX_ID_REQUIRED: {
    code: 'TAX_ID_REQUIRED',
    status: 400,
    message: 'taxId is required and must be a string',
  },
  INVALID_TAX_ID_FORMAT: {
    code: 'INVALID_TAX_ID_FORMAT',
    status: 400,
    message: 'taxId format must be NN-NNNNNNNN-N',
  },
  NAME_REQUIRED: {
    code: 'NAME_REQUIRED',
    status: 400,
    message: 'name is required and must be a non-empty string',
  },
  INVALID_COMPANY_TYPE: {
    code: 'INVALID_COMPANY_TYPE',
    status: 400,
    message: 'type must be PYME or CORPORATIVA',
  },
  INVALID_COUNTRY: {
    code: 'INVALID_COUNTRY',
    status: 400,
    message: 'country must be a non-empty string when provided',
  },
  JOINED_LAST_MONTH_FETCH_FAILED: {
    code: 'JOINED_LAST_MONTH_FETCH_FAILED',
    status: 500,
    message: 'Failed to fetch companies joined in the last month',
  },
  WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED: {
    code: 'WITH_TRANSFERS_LAST_MONTH_FETCH_FAILED',
    status: 500,
    message: 'Failed to fetch companies with transfers in the last month',
  },
  PERSISTENCE_READ_FAILED: {
    code: 'PERSISTENCE_READ_FAILED',
    status: 503,
    message: 'Failed to read persisted data',
    retryable: true,
  },
  PERSISTENCE_WRITE_FAILED: {
    code: 'PERSISTENCE_WRITE_FAILED',
    status: 503,
    message: 'Failed to persist data',
    retryable: true,
  },
  PERSISTED_DATA_INVALID: {
    code: 'PERSISTED_DATA_INVALID',
    status: 500,
    message: 'Persisted data is invalid',
    retryable: false,
  },
  COMPANY_TAX_ID_ALREADY_EXISTS: {
    code: 'COMPANY_TAX_ID_ALREADY_EXISTS',
    status: 409,
    message: 'Company with taxId %s already exists',
  },
  UNEXPECTED_CREATE_COMPANY_ERROR: {
    code: 'UNEXPECTED_CREATE_COMPANY_ERROR',
    status: 500,
    message: 'Unexpected error creating company',
  },
} as const satisfies Record<string, ErrorCatalogEntry>;

export type ErrorCatalogKey = keyof typeof ERROR_CATALOG;
