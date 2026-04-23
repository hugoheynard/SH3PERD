import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { TContractDomainModel, TUserId } from '@sh3pherd/shared-types';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { GetCurrentUserContractsQuery } from '../application/queries/GetCurrentUserContractsQuery.js';

/**
 * Controller for contract endpoints scoped to the authenticated user,
 * independent of any active company contract context.
 *
 * Split from {@link ContractController} because that class uses
 * `@ContractScoped()` at class level (required so `ContractContextGuard`
 * runs before `PermissionGuard` — see the note on
 * `orgchart-export.controller.ts`). A `/me` route cannot require a
 * resolved contract since the whole point is to list what the user has
 * — so it lives here.
 */
@ApiTags('contracts')
@ApiBearerAuth('bearer')
@Controller()
export class MyContractsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get current user contracts',
    description:
      'Returns all contracts where the authenticated user is the employee/contractor. Each record is hydrated through the domain entity.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of contract domain models for the current user.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'contract_abc-123' },
          user_id: { type: 'string', example: 'user_xyz-456' },
          company_id: { type: 'string', example: 'company_def-789' },
          roles: { type: 'array', items: { type: 'string' }, example: ['artist'] },
          status: { type: 'string', enum: ['draft', 'active', 'terminated'], example: 'active' },
          contract_type: {
            type: 'string',
            enum: ['CDI', 'CDD', 'freelance', 'stage', 'alternance'],
            example: 'CDI',
          },
          job_title: { type: 'string', example: 'Sound Engineer' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @Get('me')
  getCurrentUserContractList(@ActorId() actorId: TUserId): Promise<TContractDomainModel[]> {
    return this.queryBus.execute(new GetCurrentUserContractsQuery(actorId));
  }
}
