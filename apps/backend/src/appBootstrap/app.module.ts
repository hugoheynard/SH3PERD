import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { MongoModule } from './database/MongoModule.js';
import { ProtectedModule } from './protected.module.js';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module.js';
import { AuthGuard } from '../auth/api/auth.guard.js';
import { TokenFunctionsModule } from '../auth/core/TokenFunctions.module.js';
import { CoreRepositoriesModule } from './database/CoreRepositoriesModule.js';
import { UserModule } from '../user/user.module.js';
import { ContractModule } from '../contracts/contract.module.js';
import { MusicModule } from '../music/music.module.js';
import { UserProfileModule } from '../user/profile/user-profile.module.js';
import { GlobalCqrsModule } from './global-cqrs.module.js';
import { CompanyModule } from '../company/company.module.js';
import { PlaylistModule } from '../playlists-v2/playlist.module.js';
import { ShowModule } from '../shows/show.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { PrintModule } from '../print/print.module.js';
import { MusicCrossModule } from '../music/music-cross.module.js';
import { PlatformContractModule } from '../platform-contract/platform-contract.module.js';
import { QuotaModule } from '../quota/quota.module.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { MailerModule } from '../mailer/mailer.module.js';
import { GlobalExceptionFilter } from '../utils/errorManagement/GlobalExceptionFilter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      ignoreEnvFile: false, // Ignores the default .env file, we manage it
      cache: true, // Caches the configuration for performance
      load: [configuration], // You can load additional configuration files or functions here
    }),
    GlobalCqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        // In test/e2e environments, effectively disable throttling so
        // tests can make rapid API calls without hitting 429s.
        limit: process.env['NODE_ENV'] === 'test' ? 10_000 : 30,
      },
    ]),
    // Database module, returns MongoClient instance
    MongoModule,
    // Token verification for AuthGuard
    TokenFunctionsModule,
    CoreRepositoriesModule,
    // Modules
    AuthModule,
    IntegrationsModule,
    UserModule,
    UserProfileModule,
    ContractModule,
    PlatformContractModule,
    QuotaModule,
    MusicCrossModule,
    ProtectedModule,
    PlaylistModule,
    ShowModule,
    PrintModule,
    AnalyticsModule,
    MailerModule,
    // ⚠️ Prefix split
    RouterModule.register([
      { path: 'auth', module: AuthModule },
      { path: 'auth/slack', module: IntegrationsModule },
      {
        path: 'protected',
        module: ProtectedModule,
        children: [
          {
            path: 'user',
            module: UserModule,
            children: [{ path: 'profile', module: UserProfileModule }],
          },
          { path: 'music', module: MusicModule },
          { path: 'contracts', module: ContractModule },
          { path: 'companies', module: CompanyModule },
          { path: 'companies', module: MusicCrossModule },
          { path: '', module: PrintModule },
          { path: 'integrations', module: IntegrationsModule },
          { path: 'playlists', module: PlaylistModule },
          { path: 'shows', module: ShowModule },
          { path: '', module: QuotaModule },
          { path: '', module: AnalyticsModule },
        ],
      },
    ]),
  ],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  controllers: [AppController],
})
export class AppModule {}
