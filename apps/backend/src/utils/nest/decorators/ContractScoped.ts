import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';

export const CONTRACT_SCOPED_KEY = 'scoped';
type ClassTarget = abstract new (...args: never[]) => unknown;

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
 * Works at both class level and method level.
 *
 * @example
 * ```ts
 * // Class level — all routes require contract context
 * @ContractScoped()
 * @Controller('settings')
 * export class SettingsController { ... }
 *
 * // Method level — only this route requires contract context
 * @ContractScoped()
 * @RequirePermission(P.Company.OrgChart.Read)
 * @Get('orgchart')
 * getOrgChart() { ... }
 * ```
 */
export function ContractScoped(): ClassDecorator & MethodDecorator {
  const composed = applyDecorators(
    SetMetadata(CONTRACT_SCOPED_KEY, true),
    UseGuards(ContractContextGuard),
  );

  const decorator: ClassDecorator & MethodDecorator = (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void => {
    if (propertyKey && descriptor) {
      // Method-level: apply each decorator individually to the descriptor
      SetMetadata(CONTRACT_SCOPED_KEY, true)(target, propertyKey, descriptor);
      UseGuards(ContractContextGuard)(target, propertyKey, descriptor);
    } else {
      // Class-level: use composed decorator
      composed(target as ClassTarget);
    }
  };

  return decorator;
}
