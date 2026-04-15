import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PlatformContractContextGuard } from '../../../platform-contract/api/platform-contract-context.guard.js';

export const PLATFORM_SCOPED_KEY: string = 'platformScoped';
type ClassTarget = abstract new (...args: never[]) => unknown;

/**
 * Marks a controller or method as requiring a platform contract context.
 *
 * Applies `PlatformContractContextGuard`, which:
 * 1. Reads `user_id` from the request (set by AuthGuard)
 * 2. Loads the user's platform contract from `platform_contracts` collection
 * 3. Attaches `request.contract_roles = [platformContract.plan]`
 *
 * After this, `@RequirePermission()` works exactly as with company
 * contracts — the only difference is where the roles come from
 * (platform contract vs company contract).
 *
 * Works at both class level and method level.
 *
 * ```ts
 * @PlatformScoped()
 * @Controller('library')
 * export class MusicLibraryController { ... }
 * ```
 */
export function PlatformScoped(): ClassDecorator & MethodDecorator {
  const composed = applyDecorators(
    SetMetadata(PLATFORM_SCOPED_KEY, true),
    UseGuards(PlatformContractContextGuard),
  );

  const decorator: ClassDecorator & MethodDecorator = (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ): void => {
    if (propertyKey && descriptor) {
      // Method-level
      SetMetadata(PLATFORM_SCOPED_KEY, true)(target, propertyKey, descriptor);
      UseGuards(PlatformContractContextGuard)(target, propertyKey, descriptor);
    } else {
      // Class-level
      composed(target as ClassTarget);
    }
  };

  return decorator;
}
