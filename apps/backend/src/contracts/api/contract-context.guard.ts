import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { IUserPreferencesRepository } from '../../user/infra/UserPreferencesMongoRepo.repository.js';
import { USER_PREFERENCES_REPO, CONTRACT_REPO } from '../../appBootstrap/nestTokens.js';
import { UserPreferences } from '../../user/domain/UserPreferences.entity.js';
import { Reflector } from '@nestjs/core';
import { CONTRACT_SCOPED_KEY } from '../../utils/nest/decorators/ContractScoped.js';
import type { IContractRepository } from '../repositories/ContractMongoRepository.js';
import type { TContractId, TUserId } from '@sh3pherd/shared-types';

/**
 * ContractContextGuard — resolves the active contract for the current request.
 *
 * ## Resolution order
 * 1. **Header** `X-Contract-Id` — preferred, sent by the frontend via `ScopedHttpClient.withContract()`
 * 2. **Database fallback** — reads `contract_workspace` from UserPreferences
 *
 * Once the contract ID is resolved, the guard loads the full contract record
 * and verifies the authenticated user owns it. On success, it attaches:
 * - `request.contract_id`    — the resolved contract ID
 * - `request.contract_roles` — the roles array from the contract (e.g. `['owner', 'admin']`)
 *
 * This guard only activates on routes marked with `@ContractScoped()`.
 */
@Injectable()
export class ContractContextGuard implements CanActivate {
  constructor(
    @Inject(USER_PREFERENCES_REPO) private readonly userPrefsRepo: IUserPreferencesRepository,
    @Inject(CONTRACT_REPO) private readonly contractRepo: IContractRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isScoped = this.reflector.getAllAndOverride<boolean>(CONTRACT_SCOPED_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!isScoped) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const { user_id } = req;

    // 1. Resolve contract ID — header first, DB fallback
    const contractId = this.resolveContractId(req) ?? await this.fallbackFromPreferences(user_id);

    if (!contractId) {
      throw new UnauthorizedException('No contract context — provide X-Contract-Id header or set a workspace in preferences');
    }

    // 2. Load & verify contract belongs to this user
    const contract = await this.contractRepo.findOne({ filter: { id: contractId, user_id } });

    if (!contract) {
      throw new UnauthorizedException('Contract not found or does not belong to this user');
    }

    // 3. Attach to request
    req.contract_id = contract.id;
    req.contract_roles = contract.roles ?? [];

    return true;
  }

  /**
   * Read contract ID from the X-Contract-Id header.
   */
  private resolveContractId(req: Request): TContractId | null {
    const header = req.headers['x-contract-id'];
    if (!header || typeof header !== 'string') {
      return null;
    }
    return header as TContractId;
  }

  /**
   * Fallback: read the user's active workspace from their preferences in DB.
   */
  private async fallbackFromPreferences(userId: TUserId): Promise<TContractId | null> {
    const record = await this.userPrefsRepo.findOne({ filter: { user_id: userId } });
    if (!record) {
      return null;
    }
    return UserPreferences.fromRecord(record).contractWorkspace ?? null;
  }
}
