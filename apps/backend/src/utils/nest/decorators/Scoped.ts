import {
  applyDecorators,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';

/**
 * Décorateur Scoped :
 * - Peut être appliqué sur un contrôleur ou une méthode
 * - Applique automatiquement le prefix `/scoped/{scope}`
 * - Ajoute le guards ContractContext
 */
export function Scoped(scope: 'contract' | 'workspace' = 'contract'): ClassDecorator & MethodDecorator {

  return ((target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey) {
      // ✅ appliqué sur une méthode
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata(`isScoped::${scope}`, true),
      )(target, propertyKey, descriptor);
      return;
    } else {
      // ✅ appliqué sur un contrôleur
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata(`isScoped::${scope}`, true),
      )(target);
    }
  }) as any;
}
