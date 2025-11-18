import { Module } from '@nestjs/common';
import { GetCurrentUserViewModelHandler } from './application/query/GetCurrentUserViewModel.js';
import { CqrsModule } from '@nestjs/cqrs';


const QueryHandlers = [GetCurrentUserViewModelHandler];

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
