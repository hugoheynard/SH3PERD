import {
  applyDecorators,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ContractContextGuard } from '../../../contracts/api/contract-context.guard.js';


export const CONTRACT_SCOPED_KEY = 'scoped';
/**
 * Décorateur Scoped :
 * - Peut être appliqué sur un contrôleur ou une méthode
 * - Applique automatiquement le prefix `/scoped/{scope}`
 * - Ajoute le guards ContractContext
 */
export function ContractScoped(): ClassDecorator & MethodDecorator {

  return ((target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey) {
      // ✅ appliqué sur une méthode
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata(CONTRACT_SCOPED_KEY, true),
      )(target, propertyKey, descriptor);
      return;
    } else {
      // ✅ appliqué sur un contrôleur
      applyDecorators(
        UseGuards(ContractContextGuard),
        SetMetadata(CONTRACT_SCOPED_KEY, true),
      )(target);
    }
  }) as any;
}
