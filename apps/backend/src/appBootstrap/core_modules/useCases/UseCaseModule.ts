import { CoreUseCasesModule } from './CoreUseCasesModule.js';
import { CORE_USECASES, USE_CASES_TOKENS } from '../../nestTokens.js';
import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';


@Module({})
export class UseCasesModule {
  static for(feature: keyof typeof USE_CASES_TOKENS): DynamicModule {
    return UseCasesModule.forMany([feature]);
  };

  static forMany(features: (keyof typeof USE_CASES_TOKENS)[]): DynamicModule {
    const providers = features.map((key) => ({
      provide: USE_CASES_TOKENS[key],
      useFactory: (coreUseCases: any) => coreUseCases[key],
      inject: [CORE_USECASES],
    }));

    return {
      module: UseCasesModule,
      imports: [CoreUseCasesModule],
      providers,
      exports: providers.map((p) => p.provide),
    };
  }
}