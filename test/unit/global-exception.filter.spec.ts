import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { GlobalExceptionFilter } from '../../src/infrastructure/http/filters/global-exception.filter';

describe('GlobalExceptionFilter', () => {
  it('maps exception payload and writes standardized response', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const response = { status, json };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as ArgumentsHost;

    const filter = new GlobalExceptionFilter();
    filter.catch(new BadRequestException('taxId format must be NN-NNNNNNNN-N'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      code: 'INVALID_TAX_ID_FORMAT',
      message: 'taxId format must be NN-NNNNNNNN-N',
      statusCode: 400,
    });
  });
});