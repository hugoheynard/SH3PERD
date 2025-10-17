import {
  applyDecorators,
  Controller,
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
  const prefix = `scoped/${scope}`;

  return ((target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey) {
      // ✅ appliqué sur une méthode
      const routePath = Reflect.getMetadata('path', descriptor?.value) ?? '';
      Reflect.defineMetadata('path', `${prefix}/${routePath}`, descriptor?.value);
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata('isScoped', true),
      )(target, propertyKey, descriptor);
    } else {
      // ✅ appliqué sur un contrôleur
      applyDecorators(
        Controller(prefix),
        UseGuards(ContractContextGuard),
        SetMetadata('isScoped', true),
      )(target);
    }
  }) as any;
}
