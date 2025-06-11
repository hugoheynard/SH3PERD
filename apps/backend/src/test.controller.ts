import { Controller, Get } from '@nestjs/common';


@Controller('test')
export class TestController {
  @Get()
  getStatus(): string {
    return 'API ok';
  }
}