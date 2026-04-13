import { BusinessError } from '../BusinessError.js';

describe('BusinessError', () => {
  it('should create with code and default status 400', () => {
    const error = new BusinessError('Invalid request', { code: 'INVALID_REQUEST' });

    expect(error).toBeInstanceOf(BusinessError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid request');
    expect(error.code).toBe('INVALID_REQUEST');
    expect(error.status).toBe(400);
    expect(error.name).toBe('BusinessError');
  });

  it('should create with explicit status', () => {
    const error = new BusinessError('Company not found', {
      code: 'COMPANY_NOT_FOUND',
      status: 404,
    });

    expect(error.status).toBe(404);
    expect(error.code).toBe('COMPANY_NOT_FOUND');
  });

  it('should preserve instanceof chain', () => {
    const error = new BusinessError('Forbidden', { code: 'FORBIDDEN', status: 403 });

    expect(error instanceof BusinessError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});
