import { Module } from '@nestjs/common';
import { MusicModule } from '../music/music.module.js';
import { ContractContextGuard } from '../contracts/api/contract-context.guard.js';
import { TokenFunctionsModule } from '../auth/core/TokenFunctions.module.js';
import { ContractModule } from '../contracts/contract.module.js';
import { UserModule } from '../user/user.module.js';
import { UserGroupsModule } from '../userGroups/user-groups.module.js';
import { CompanyModule } from '../company/company.module.js';
import { PlaylistModule } from '../playlists-v2/playlist.module.js';
import { CONTRACT_SCOPED_GUARD } from './nestTokens.js';




@Module({
  imports: [
    TokenFunctionsModule,
    UserModule,
    MusicModule,
    ContractModule,
    UserGroupsModule,
    CompanyModule,
    PlaylistModule,
  ],
  providers: [
    { provide: CONTRACT_SCOPED_GUARD, useClass: ContractContextGuard }
    ],
  exports: [],
})
export class ProtectedModule {
  // This module is intended for protected routes and services.
  // It can be extended with additional controllers, providers, or imports as needed.
  // Currently, it does not contain any specific functionality.
}
