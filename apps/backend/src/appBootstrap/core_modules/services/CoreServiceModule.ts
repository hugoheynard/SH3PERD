import { Module } from '@nestjs/common';
import { CORE_REPOSITORIES, CORE_SERVICES } from '../../nestTokens.js';
import { createCoreServices, type TCoreServices } from '../../initFactories/createCoreServices.js';
import { CoreRepositoriesModule } from '../repositories/CoreRepositoriesModule.js';
import type { TCoreRepositories } from '../../initFactories/createCoreRepositories.js';

@Module({
  imports: [CoreRepositoriesModule],
  providers: [
    {
      provide: CORE_SERVICES,
      useFactory: (repositories: TCoreRepositories): TCoreServices => {
        return createCoreServices({ repositories });
      },
      inject: [CORE_REPOSITORIES],
    },
  ],
  exports: [CORE_SERVICES],
})
export class CoreServicesModule {
  // This module initializes core services using the provided repositories.
  // It can be extended with additional providers or exports as needed.
}
