import { CoreUseCasesModule } from './CoreUseCasesModule.js';
import { CORE_USECASES, USE_CASES_TOKENS } from '../../nestTokens.js';
import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import type { TCoreUseCases } from '../../initFactories/createCoreUseCases.js';

@Module({})
export class CoreUseCasesAccessModule {
  static for(feature: keyof typeof USE_CASES_TOKENS): DynamicModule {
    return CoreUseCasesAccessModule.forMany([feature]);
  }

  static forMany(features: (keyof typeof USE_CASES_TOKENS)[]): DynamicModule {
    const providers = features.map((key) => ({
      provide: USE_CASES_TOKENS[key],
      useFactory: (coreUseCases: TCoreUseCases) => coreUseCases[key],
      inject: [CORE_USECASES],
    }));

    return {
      module: CoreUseCasesAccessModule,
      imports: [CoreUseCasesModule],
      providers,
      exports: providers.map((p) => p.provide),
    };
  }
}
