import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { mapErrorToResponse } from '../utils/error-response.mapper';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const payload = mapErrorToResponse(exception);

    response.status(payload.statusCode).json(payload);
  }
}