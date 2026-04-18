import { Module } from '@nestjs/common';
import { TurnstileService } from './TurnstileService.js';
import { getTurnstileConfig } from './getTurnstileConfig.js';
import { TURNSTILE_SERVICE } from '../auth.tokens.js';
import type { ITurnstileService } from './types.js';

@Module({
  providers: [
    {
      provide: TURNSTILE_SERVICE,
      useFactory: (): ITurnstileService => new TurnstileService(getTurnstileConfig()),
    },
  ],
  exports: [TURNSTILE_SERVICE],
})
export class TurnstileModule {}
