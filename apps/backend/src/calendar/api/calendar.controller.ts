import { Controller, Get } from '@nestjs/common';

@Controller('calendar')
export class CalendarController {
  // This controller can be extended with methods to handle calendar-related requests.
  @Get()
  getCalendar(): void {}
}


