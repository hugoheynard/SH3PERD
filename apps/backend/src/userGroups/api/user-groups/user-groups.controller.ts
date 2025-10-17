import { Controller, Get, Req } from '@nestjs/common';
import { Scoped } from '../../../utils/nest/decorators/Scoped.js';
import type { Request } from 'express';


@Controller('user-groups')
export class UserGroupsController {

  @Scoped('contract')
  @Get('/me')
  getMyContracts(@Req() req:  Request) {
    const { user_id, contract_id } = req;

    console.log({ user_id, contract_id });
  };
}
