import { Module } from '@nestjs/common';
import { CoreRepositoriesModule } from '../repositories/CoreRepositoriesModule.js';
import { CoreServicesModule } from '../services/CoreServiceModule.js';
import { CORE_REPOSITORIES, CORE_SERVICES, CORE_USECASES } from '../../nestTokens.js';
import { createCoreUseCases } from '../../initFactories/createCoreUseCases.js';
import type { TCoreRepositories } from '../../initFactories/createCoreRepositories.js';
import type { TCoreServices } from '../../initFactories/createCoreServices.js';

@Module({
  imports: [CoreRepositoriesModule, CoreServicesModule],
  controllers: [],
  providers: [
    {
      provide: CORE_USECASES,
      useFactory: (services: TCoreServices, repositories: TCoreRepositories) => {
        return createCoreUseCases({ services, repositories });
      },
      inject: [CORE_SERVICES, CORE_REPOSITORIES],
    },
  ],
  exports: [CORE_USECASES],
})
export class CoreUseCasesModule {
  // This module initializes core use cases using the provided services and repositories.
  // It can be extended with additional providers or exports as needed.
  // Currently, it does not contain any specific functionality.
}
