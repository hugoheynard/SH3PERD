import { Module } from '@nestjs/common';
import { ShowHandlersModule } from './show-handlers.module.js';
import { ShowController } from './api/show.controller.js';

@Module({
  imports: [ShowHandlersModule],
  controllers: [ShowController],
})
export class ShowModule {}
