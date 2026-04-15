import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Custom decorator to extract the current contract's ID from the request object.
 * Usage: @CurrentContract() contractId: TContractId
 */
export const CurrentContract = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.contract_id;
});
