import { ContractContextGuard } from './contract-context.guard.js';
import { Reflector } from '@nestjs/core';

describe('ContractContextGuard', () => {
  it('should be defined', () => {
    expect(new ContractContextGuard({} as any, {} as any, new Reflector())).toBeDefined();
  });
});
