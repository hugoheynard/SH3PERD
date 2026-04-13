import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current contract's ID from the request object.
 * Usage: @CurrentContract() contractId: TContractId
 */
export const CurrentContract = createParamDecorator((ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.contract_id;
});
