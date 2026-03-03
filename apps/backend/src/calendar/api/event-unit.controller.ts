import { Body, Controller, Post, Req } from '@nestjs/common';
import { createEventUnit } from '../useCases/eventsUseCase.composition.js';
import type { Request } from 'express';

@Controller('event-unit')
export class EventUnitController {

  @Post()
  createEvent(
    @Req() req: Request,
    @Body() requestDTO: any
  ) {
    return createEventUnit({
      asker_id: req.user_id,
      requestDTO
    })
  }
}
