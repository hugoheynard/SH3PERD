import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TContractId } from '@sh3pherd/shared-types';

/**
 * Parameter decorator — extracts the resolved contract ID from the request.
 *
 * Requires the route to be protected by `@ContractScoped()` so that
 * `ContractContextGuard` has already resolved and attached `request.contract_id`.
 *
 * @example
 * ```ts
 * @ContractScoped()
 * @Get('data')
 * getData(@ContractId() contractId: TContractId) { ... }
 * ```
 */
export const ContractId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TContractId => {
    const request = ctx.switchToHttp().getRequest();
    const contractId = request.contract_id;
    if (!contractId) {
      throw new Error('ContractId decorator used without @ContractScoped() — contract_id is missing from request');
    }
    return contractId;
  },
);
