import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PLATFORM_SCOPED_KEY } from '../../utils/nest/decorators/PlatformScoped.js';
import { PLATFORM_CONTRACT_REPO } from '../../appBootstrap/nestTokens.js';
import type { IPlatformContractRepository } from '../infra/PlatformContractMongoRepo.js';
import type { TUserId } from '@sh3pherd/shared-types';

/**
 * Guard that resolves the platform contract for the authenticated user.
 *
 * Unlike `ContractContextGuard` (which reads `X-Contract-Id` from
 * headers), this guard resolves the platform contract by querying
 * `{ user_id }` — no header needed because each user has exactly
 * one platform contract.
 *
 * On success, attaches:
 * - `request.contract_roles = [platformContract.plan]`
 *   e.g. `['plan_free']` — picked up by `PermissionGuard` downstream
 * - `request.platform_contract_id` — the platform contract's ID
 *
 * Only activates on routes decorated with `@PlatformScoped()`.
 */
@Injectable()
export class PlatformContractContextGuard implements CanActivate {
  constructor(
    @Inject(PLATFORM_CONTRACT_REPO) private readonly platformRepo: IPlatformContractRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPlatformScoped = this.reflector.getAllAndOverride<boolean>(PLATFORM_SCOPED_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!isPlatformScoped) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const userId = req.user_id as TUserId;

    if (!userId) {
      throw new UnauthorizedException('No authenticated user — platform contract cannot be resolved');
    }

    const platformContract = await this.platformRepo.findByUserId(userId);

    if (!platformContract) {
      throw new UnauthorizedException('No platform contract found for this user');
    }

    if (platformContract.status !== 'active') {
      throw new UnauthorizedException('Platform subscription is suspended');
    }

    // Attach the plan as the role — PermissionGuard will expand it
    // via PLATFORM_ROLE_TEMPLATES automatically.
    req.contract_roles = [platformContract.plan] as any;
    (req as any).platform_contract_id = platformContract.id;

    return true;
  }
}
