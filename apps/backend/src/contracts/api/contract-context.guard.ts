import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { IUserPreferencesRepository } from '../../user/repository/UserPreferencesMongoRepository.js';
import { USER_PREFERENCES_REPO } from '../../appBootstrap/nestTokens.js';



/**
 * `ContractContextGuard` is a NestJS guard that ensures the request context includes the active contract ID for authenticated users.
 *
 *  * 🔐 Responsibilities:
 *  - Checks if the request URL pertains to contract-scoped routes.
 *  - Fetches the user's active contract ID from the database and attaches it to the request object.
 *
 *  If not in Nest, this logic would typically reside in middleware.
 */
//TODO: Could be a better repo access pattern here
@Injectable()
export class ContractContextGuard implements CanActivate {
  constructor(@Inject(USER_PREFERENCES_REPO) private readonly userPrefsRepos: IUserPreferencesRepository) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const { url, user_id } = req;


    if (!url.includes('/scoped/contract')) {
      return true;
    }

    const dbUser = await this.userPrefsRepos.findOne({ filter: { user_id: user_id } });

    const workspaceContract_id = dbUser?.preferences?.contract_workspace

    if (!workspaceContract_id) {
      throw new UnauthorizedException({ message: 'No workspace in preferences' }, 'UNAUTHORIZED');
    }


    req.contract_id = workspaceContract_id;
    return true;
  }
}
