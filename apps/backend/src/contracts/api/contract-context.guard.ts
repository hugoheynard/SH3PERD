import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { IUserPreferencesRepository } from '../../user/preferences/UserPreferencesMongoRepo.repository.js';
import { USER_PREFERENCES_REPO } from '../../appBootstrap/nestTokens.js';
import { UserPreferences } from '../../user/preferences/UserPreferences.entity.js';
import { Reflector } from '@nestjs/core';
import { CONTRACT_SCOPED_KEY } from '../../utils/nest/decorators/ContractScoped.js';


/**
 * `ContractContextGuard` is a NestJS guard that ensures the request context includes the active contract ID for authenticated users.
 *
 *  * 🔐 Responsibilities:
 *  - Checks if the request URL pertains to contract-scoped routes.
 *  - Fetches the user's active contract ID from the database and attaches it to the request object.
 *
 *  If not in Nest, this logic would typically reside in middleware.
 */
@Injectable()
export class ContractContextGuard implements CanActivate {
  constructor(
    @Inject(USER_PREFERENCES_REPO) private readonly userPrefsRepos: IUserPreferencesRepository,
    private readonly reflector: Reflector
  ) {};

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const { user_id } = req;

    const contractScope = this.reflector.getAllAndOverride<string>(CONTRACT_SCOPED_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!contractScope) {
      return true;
    }

    const dbUserPrefs = await this.userPrefsRepos.findOne({ filter: { user_id: user_id } });

    if (!dbUserPrefs) {
      throw new UnauthorizedException({ message: 'User preferences not found' }, 'UNAUTHORIZED');
    }

    const workspaceContract_id = UserPreferences.fromRecord(dbUserPrefs).contractWorkspace

    if (!workspaceContract_id) {
      throw new UnauthorizedException({ message: 'No workspace in preferences' }, 'UNAUTHORIZED');
    }

    req.contract_id = workspaceContract_id;
    return true;
  };
}
