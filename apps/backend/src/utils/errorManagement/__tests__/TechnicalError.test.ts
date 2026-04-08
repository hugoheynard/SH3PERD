import { TechnicalError } from '../TechnicalError.js';

describe('TechnicalError', () => {
  it('should create with code only', () => {
    const error = new TechnicalError('DB write failed', { code: 'DB_WRITE_FAILED' });

    expect(error).toBeInstanceOf(TechnicalError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('DB write failed');
    expect(error.code).toBe('DB_WRITE_FAILED');
    expect(error.name).toBe('TechnicalError');
  });

  it('should chain the original cause', () => {
    const original = new Error('ECONNREFUSED');
    const error = new TechnicalError('MongoDB connection failed', {
      code: 'MONGO_CONNECT_FAILED',
      cause: original,
    });

    expect(error.cause).toBe(original);
  });

  it('should carry context metadata', () => {
    const error = new TechnicalError('Failed to update', {
      code: 'UPDATE_FAILED',
      context: { companyId: 'company_abc', operation: 'updateOne' },
    });

    expect(error.context).toEqual({ companyId: 'company_abc', operation: 'updateOne' });
  });

  it('should work with cause + context together', () => {
    const original = new Error('timeout');
    const error = new TechnicalError('External service failed', {
      code: 'SERVICE_TIMEOUT',
      cause: original,
      context: { service: 'slack', endpoint: '/channels.list' },
    });

    expect(error.cause).toBe(original);
    expect(error.context).toEqual({ service: 'slack', endpoint: '/channels.list' });
    expect(error.code).toBe('SERVICE_TIMEOUT');
  });

  it('should preserve instanceof chain', () => {
    const error = new TechnicalError('fail', { code: 'FAIL' });

    expect(error instanceof TechnicalError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});
