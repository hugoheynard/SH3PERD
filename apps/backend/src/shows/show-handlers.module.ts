import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QuotaModule } from '../quota/quota.module.js';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { ShowAggregateRepository } from './repositories/ShowAggregateRepository.js';

import { CreateShowHandler } from './application/commands/CreateShowHandler.js';
import { UpdateShowInfoHandler } from './application/commands/UpdateShowInfoHandler.js';
import { DeleteShowHandler } from './application/commands/DeleteShowHandler.js';
import { DuplicateShowHandler } from './application/commands/DuplicateShowHandler.js';
import {
  AddShowSectionHandler,
  RemoveShowSectionHandler,
  ReorderShowSectionsHandler,
  UpdateShowSectionHandler,
} from './application/commands/SectionCommands.js';
import {
  AddShowSectionItemHandler,
  MoveShowSectionItemHandler,
  RemoveShowSectionItemHandler,
  ReorderShowSectionItemsHandler,
} from './application/commands/ItemCommands.js';
import {
  MarkSectionPlayedHandler,
  MarkShowPlayedHandler,
} from './application/commands/MarkPlayedHandlers.js';
import { ConvertSectionToPlaylistHandler } from './application/commands/ConvertSectionToPlaylistHandler.js';

import { GetShowDetailHandler } from './application/queries/GetShowDetailHandler.js';
import { ListUserShowsHandler } from './application/queries/ListUserShowsHandler.js';

const CommandHandlers = [
  CreateShowHandler,
  UpdateShowInfoHandler,
  DeleteShowHandler,
  DuplicateShowHandler,
  AddShowSectionHandler,
  UpdateShowSectionHandler,
  RemoveShowSectionHandler,
  ReorderShowSectionsHandler,
  AddShowSectionItemHandler,
  RemoveShowSectionItemHandler,
  ReorderShowSectionItemsHandler,
  MoveShowSectionItemHandler,
  MarkShowPlayedHandler,
  MarkSectionPlayedHandler,
  ConvertSectionToPlaylistHandler,
];

const QueryHandlers = [GetShowDetailHandler, ListUserShowsHandler];

@Module({
  imports: [CqrsModule, QuotaModule, AnalyticsModule],
  providers: [ShowAggregateRepository, ...CommandHandlers, ...QueryHandlers],
  exports: [ShowAggregateRepository, ...CommandHandlers, ...QueryHandlers],
})
export class ShowHandlersModule {}
