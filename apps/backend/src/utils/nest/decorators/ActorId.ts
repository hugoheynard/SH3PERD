import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current user's ID from the request object.
 * Usage: @CurrentUser() userId: TUserId
 */
export const ActorId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user_id;
  }
);