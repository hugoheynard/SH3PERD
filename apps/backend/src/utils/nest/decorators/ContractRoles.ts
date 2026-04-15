import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TContractRole } from '@sh3pherd/shared-types';
import type { Request } from 'express';

/**
 * Parameter decorator — extracts the contract roles from the request.
 *
 * Requires the route to be protected by `@ContractScoped()` so that
 * `ContractContextGuard` has already resolved and attached `request.contract_roles`.
 *
 * @example
 * ```ts
 * @ContractScoped()
 * @Get('settings')
 * getSettings(@ContractRoles() roles: TContractRole[]) {
 *   if (roles.includes('admin')) { ... }
 * }
 * ```
 */
export const ContractRoles = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TContractRole[] => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.contract_roles ?? [];
  },
);
