import { StructuredLoggerService } from '../../src/infrastructure/logging/structured-logger.service';

describe('StructuredLoggerService', () => {
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  it('logs info payloads to console.log', () => {
    const logger = new StructuredLoggerService();
    logger.log('request.start', { correlationId: 'abc' });

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(String((console.log as jest.Mock).mock.calls[0][0])).toContain('request.start');
    expect(String((console.log as jest.Mock).mock.calls[0][0])).toContain('abc');
  });

  it('logs warn payloads to console.warn', () => {
    const logger = new StructuredLoggerService();
    logger.warn('cache.miss');

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(String((console.warn as jest.Mock).mock.calls[0][0])).toContain('cache.miss');
  });

  it('logs error payloads with optional stack to console.error', () => {
    const logger = new StructuredLoggerService();
    logger.error('request.error', { correlationId: 'xyz' }, 'stacktrace');

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(String((console.error as jest.Mock).mock.calls[0][0])).toContain('request.error');
    expect(String((console.error as jest.Mock).mock.calls[0][0])).toContain('stacktrace');
  });

  it('logs error payloads without stack when not provided', () => {
    const logger = new StructuredLoggerService();
    logger.error('request.error');

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(String((console.error as jest.Mock).mock.calls[0][0])).not.toContain('stacktrace');
  });
});