import { Controller, Get } from '@nestjs/common';


@Controller('test')
export class TestController {
  @Get()
  getStatus(): void {
    return 'API ok';
  }
}