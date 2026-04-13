import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActorId } from '../../utils/nest/decorators/ActorId.js';
import { buildApiResponseDTO } from '../../music/codes.js';
import type { TCompanyId, TUserId } from '@sh3pherd/shared-types';
import { COMPANY_CODES_SUCCESS } from './company.codes.js';

import {
  CreateCompanyCommand,
  type TCreateCompanyResult,
} from '../application/commands/CreateCompanyCommand.js';
import { GetCompanyByIdQuery } from '../application/queries/GetCompanyByIdQuery.js';
import { GetMyCompaniesQuery } from '../application/queries/GetMyCompaniesQuery.js';

@ApiTags('companies')
@ApiBearerAuth('bearer')
@Controller()
export class CompanyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // TODO: Platform-level action — currently any authenticated user can create a company.
  //       When plans/restrictions are added, guard with @RequirePlatformPermission('platform:company:create').
  @ApiOperation({
    summary: 'Create a company',
    description:
      'Creates a new company and an owner contract for the authenticated user in a single atomic transaction. The owner contract grants full access to the company.',
  })
  @ApiBody({
    description: 'Company name. Must be non-empty.',
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, example: 'Acme Productions' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Returns the created company and owner contract domain models.',
    schema: {
      type: 'object',
      properties: {
        company: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'company_abc-123' },
            name: { type: 'string', example: 'Acme Productions' },
            owner_id: { type: 'string', example: 'user_xyz-456' },
            status: { type: 'string', example: 'active' },
            description: { type: 'string', example: '' },
            orgLayers: {
              type: 'array',
              items: { type: 'string' },
              example: ['Department', 'Team', 'Sub-team'],
            },
          },
        },
        ownerContract: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'contract_def-789' },
            user_id: { type: 'string', example: 'user_xyz-456' },
            company_id: { type: 'string', example: 'company_abc-123' },
            roles: { type: 'array', items: { type: 'string' }, example: ['owner'] },
            status: { type: 'string', example: 'active' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed (name empty).' })
  @ApiResponse({ status: 500, description: 'Transaction failed — both inserts rolled back.' })
  @Post()
  async createCompany(@Body() dto: { name: string }, @ActorId() actorId: TUserId) {
    const result = await this.commandBus.execute<CreateCompanyCommand, TCreateCompanyResult>(
      new CreateCompanyCommand(dto, actorId),
    );
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.CREATE_COMPANY, result);
  }

  @ApiOperation({
    summary: 'Get all companies for current user',
    description:
      'Returns all companies where the authenticated user has an active contract (any role: owner, admin, artist, viewer). Uses a single aggregation query joining contracts → companies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of company card view models. Empty array if user has no active contracts.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'company_abc-123' },
          name: { type: 'string', example: 'Acme Productions' },
          status: { type: 'string', enum: ['active', 'pending', 'suspended'], example: 'active' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-01-15T10:30:00.000Z' },
        },
      },
    },
  })
  @Get('my-companies')
  async getMyCompanies(@ActorId() actorId: TUserId) {
    const result = await this.queryBus.execute(new GetMyCompaniesQuery(actorId));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_MY_COMPANIES, result);
  }

  @ApiOperation({ summary: 'Get company by ID' })
  @Get(':id')
  async getCompanyById(@Param('id') id: TCompanyId) {
    const result = await this.queryBus.execute(new GetCompanyByIdQuery(id));
    return buildApiResponseDTO(COMPANY_CODES_SUCCESS.GET_COMPANY_BY_ID, result);
  }
}
