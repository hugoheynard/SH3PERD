import { Logger } from '@nestjs/common';
import { createContextLogger, newCorrelationId } from '../ContextLogger.js';

describe('ContextLogger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  const originalFormat = process.env['LOG_FORMAT'];

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFormat === undefined) delete process.env['LOG_FORMAT'];
    else process.env['LOG_FORMAT'] = originalFormat;
  });

  describe('pretty format (default)', () => {
    it('emits the message followed by the bound context as key=value pairs', () => {
      delete process.env['LOG_FORMAT'];
      const log = createContextLogger('Foo', { correlation_id: 'corr_1', user_id: 'u_1' });
      log.info('Hello');
      expect(logSpy).toHaveBeenCalledWith('Hello | correlation_id=corr_1 user_id=u_1');
    });

    it('merges per-call extra fields over the bound context', () => {
      delete process.env['LOG_FORMAT'];
      const log = createContextLogger('Foo', { a: 1 });
      log.info('with extra', { b: 2 });
      expect(logSpy).toHaveBeenCalledWith('with extra | a=1 b=2');
    });

    it('per-call fields override bound fields with the same name', () => {
      delete process.env['LOG_FORMAT'];
      const log = createContextLogger('Foo', { status: 'pending' });
      log.info('changed', { status: 'complete' });
      expect(logSpy).toHaveBeenCalledWith('changed | status=complete');
    });

    it('quotes string values that contain whitespace', () => {
      delete process.env['LOG_FORMAT'];
      const log = createContextLogger('Foo', { note: 'hello world' });
      log.info('q');
      expect(logSpy).toHaveBeenCalledWith('q | note="hello world"');
    });

    it('emits the bare message when no context is bound', () => {
      delete process.env['LOG_FORMAT'];
      const log = createContextLogger('Foo');
      log.info('bare');
      expect(logSpy).toHaveBeenCalledWith('bare');
    });

    it('routes warn / error through the matching logger methods', () => {
      delete process.env['LOG_FORMAT'];
      const log = createContextLogger('Foo', { x: 1 });
      log.warn('careful');
      log.error('boom');
      expect(warnSpy).toHaveBeenCalledWith('careful | x=1');
      expect(errorSpy).toHaveBeenCalledWith('boom | x=1');
    });
  });

  describe('JSON format (LOG_FORMAT=json)', () => {
    it('serialises to a single JSON document with the message + merged fields', () => {
      process.env['LOG_FORMAT'] = 'json';
      const log = createContextLogger('Foo', { correlation_id: 'corr_1' });
      log.info('Hello', { size_bytes: 42 });
      expect(logSpy).toHaveBeenCalledTimes(1);
      const raw = logSpy.mock.calls[0][0] as string;
      expect(JSON.parse(raw)).toEqual({
        message: 'Hello',
        correlation_id: 'corr_1',
        size_bytes: 42,
      });
    });

    it('still emits plain message when nothing is bound', () => {
      process.env['LOG_FORMAT'] = 'json';
      const log = createContextLogger('Foo');
      log.info('bare');
      expect(logSpy).toHaveBeenCalledWith('bare');
    });
  });

  describe('child()', () => {
    it('extends the bound context without mutating the parent', () => {
      delete process.env['LOG_FORMAT'];
      const parent = createContextLogger('Foo', { a: 1 });
      const child = parent.child({ b: 2 });

      parent.info('p');
      child.info('c');
      expect(logSpy).toHaveBeenNthCalledWith(1, 'p | a=1');
      expect(logSpy).toHaveBeenNthCalledWith(2, 'c | a=1 b=2');
    });
  });
});

describe('newCorrelationId', () => {
  it('returns a prefixed uuid string', () => {
    const id = newCorrelationId();
    expect(id).toMatch(/^corr_[0-9a-f-]{36}$/);
  });

  it('generates a fresh id on every call', () => {
    const ids = new Set(Array.from({ length: 10 }, () => newCorrelationId()));
    expect(ids.size).toBe(10);
  });
});
