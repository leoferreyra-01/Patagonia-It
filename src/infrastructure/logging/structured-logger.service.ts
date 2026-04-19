import { Injectable } from '@nestjs/common';

type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = {
  level: LogLevel;
  message: string;
  timestamp: string;
  correlationId?: string;
  [key: string]: unknown;
};

@Injectable()
export class StructuredLoggerService {
  log(message: string, metadata: Record<string, unknown> = {}): void {
    this.write('info', message, metadata);
  }

  warn(message: string, metadata: Record<string, unknown> = {}): void {
    this.write('warn', message, metadata);
  }

  error(
    message: string,
    metadata: Record<string, unknown> = {},
    stack?: string,
  ): void {
    this.write('error', message, {
      ...metadata,
      ...(stack ? { stack } : {}),
    });
  }

  private write(
    level: LogLevel,
    message: string,
    metadata: Record<string, unknown>,
  ): void {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    const serialized = JSON.stringify(payload);

    if (level === 'error') {
      console.error(serialized);
      return;
    }

    if (level === 'warn') {
      console.warn(serialized);
      return;
    }

    console.log(serialized);
  }
}