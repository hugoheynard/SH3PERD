import { Module } from '@nestjs/common';
import { GetCurrentUserViewModelHandler } from './application/query/GetCurrentUserViewModel.js';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUserProfileHandler } from './application/query/GetUserProfileQuery.js';


const QueryHandlers = [GetCurrentUserViewModelHandler, GetUserProfileHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QueryHandlers,
  ],
  exports: [
    ...QueryHandlers,
  ],
})
export class UserHandlersModule {}
