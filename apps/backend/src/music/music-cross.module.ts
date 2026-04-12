import { Module } from '@nestjs/common';
import { MusicHandlersModule } from './music-handlers.module.js';
import { MusicCrossLibraryController } from './api/music-cross-library.controller.js';

/**
 * Separate module for the cross library controller.
 *
 * This is mounted under `/protected/companies` (not `/protected/music`)
 * because the cross library is @ContractScoped — it needs the company
 * context to know whose libraries to cross-reference.
 *
 * URL: GET /api/protected/companies/:id/cross-library
 */
@Module({
  imports: [MusicHandlersModule],
  controllers: [MusicCrossLibraryController],
})
export class MusicCrossModule {}
