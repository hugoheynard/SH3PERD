import {
  applyDecorators,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';


export const CONTRACT_SCOPED_KEY = 'scoped';

/**
 * Marks a controller or method as requiring an active contract context.
 *
 * Applies `ContractContextGuard`, which:
 * 1. Resolves the contract ID from the `X-Contract-Id` header (or falls back to user preferences in DB)
 * 2. Loads the contract and verifies it belongs to the authenticated user
 * 3. Attaches `request.contract_id` and `request.contract_roles` to the request
 *
 * Once applied, the following decorators become available on the route:
 * - `@ContractId()`          — extracts `TContractId` from the request
 * - `@ContractRoles()`       — extracts `TContractRole[]` from the request
 * - `@RequirePermission(P.X.Y.Z)` — checks if the contract roles grant the required permission
 *
 * Can be applied at class level (all routes) or method level (single route).
 *
 * @example
 * ```ts
 * // All routes in this controller require a contract context
 * @ContractScoped()
 * @Controller('settings')
 * export class SettingsController {
 *
 *   @RequirePermission(P.Company.Settings.Write)
 *   @Patch('info')
 *   update(@ContractId() contractId: TContractId) { ... }
 * }
 *
 * // Or on a single method
 * @ContractScoped()
 * @Post('create')
 * create(@ContractId() contractId: TContractId) { ... }
 * ```
 */
export function ContractScoped(): ClassDecorator & MethodDecorator {

  return ((target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey) {
      // on method
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata(CONTRACT_SCOPED_KEY, true),
      )(target, propertyKey, descriptor);
      return;
    } else {
      // on controller
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata(CONTRACT_SCOPED_KEY, true),
      )(target);
    }
  }) as any;
}
