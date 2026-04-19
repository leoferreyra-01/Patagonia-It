import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StructuredLoggerService } from '../../logging/structured-logger.service';

const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly logger: StructuredLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<{
      method?: string;
      url?: string;
      headers?: Record<string, string | string[] | undefined>;
      correlationId?: string;
    }>();
    const response = http.getResponse<{
      statusCode?: number;
      setHeader: (name: string, value: string) => void;
    }>();

    const headerValue = request.headers?.[CORRELATION_ID_HEADER];
    const existingCorrelationId = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;
    const correlationId = existingCorrelationId?.trim() || randomUUID();
    const start = Date.now();

    request.correlationId = correlationId;
    response.setHeader(CORRELATION_ID_HEADER, correlationId);

    this.logger.log('request.start', {
      correlationId,
      method: request.method,
      path: request.url,
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.log('request.end', {
          correlationId,
          method: request.method,
          path: request.url,
          statusCode: response.statusCode,
          durationMs: Date.now() - start,
        });
      }),
      catchError((error: unknown) => {
        this.logger.error(
          'request.error',
          {
            correlationId,
            method: request.method,
            path: request.url,
            statusCode: response.statusCode,
            durationMs: Date.now() - start,
          },
          error instanceof Error ? error.stack : undefined,
        );

        return throwError(() => error);
      }),
    );
  }
}