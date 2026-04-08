import { DomainError } from '../DomainError.js';

describe('DomainError', () => {
  it('should create with code', () => {
    const error = new DomainError('Name is required', { code: 'NAME_REQUIRED' });

    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Name is required');
    expect(error.code).toBe('NAME_REQUIRED');
    expect(error.name).toBe('DomainError');
  });

  it('should carry context metadata', () => {
    const error = new DomainError('Role not assigned', {
      code: 'CONTRACT_ROLE_NOT_FOUND',
      context: { role: 'admin', contractId: 'contract_abc' },
    });

    expect(error.context).toEqual({ role: 'admin', contractId: 'contract_abc' });
  });

  it('should have undefined context when not provided', () => {
    const error = new DomainError('Invalid status', { code: 'INVALID_STATUS' });

    expect(error.context).toBeUndefined();
  });

  it('should preserve instanceof chain', () => {
    const error = new DomainError('fail', { code: 'FAIL' });

    expect(error instanceof DomainError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});
