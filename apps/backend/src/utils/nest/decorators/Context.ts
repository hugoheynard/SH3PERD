import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TUseCaseContext } from '../../../types/useCases.generic.types.js';
import type { Request } from 'express';

/**
 * A NestJS parameter decorator that extracts a scoped use case context from the request.
 * It retrieves the user ID and contract ID from the request object and constructs
 * a TUseCaseContext with 'scoped' mode.
 *
 * @throws Error if the contract ID is missing from the request.
 */

export const ContractScopedContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TUseCaseContext<'scoped'> => {
    const request: Request = ctx.switchToHttp().getRequest();

    const userId = request.user_id;
    const contractId = request.contract_id;

    if (!contractId) {
      throw new Error('Missing contract_scope for scoped context');
    }

    return {
      user_scope: userId,
      contract_scope: contractId,
    };
  },
);

export const UserScopedContext = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TUseCaseContext<'unscoped'> => {
    const request: Request = ctx.switchToHttp().getRequest();

    const userId = request.user_id;

    if (!userId) {
      throw new Error('Missing user_scope for scoped context');
    }

    return {
      user_scope: userId,
    };
  },
);
