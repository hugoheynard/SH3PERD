import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { ContractScoped } from '../../utils/nest/decorators/ContractScoped.js';
import { RequirePermission } from '../../utils/nest/guards/RequirePermission.js';
import { P } from '@sh3pherd/shared-types';
import type { TCompanyId, TCrossSearchResult, TApiResponse } from '@sh3pherd/shared-types';
import { GetCompanyCrossLibraryQuery } from '../application/queries/GetCompanyCrossLibraryQuery.js';
import { buildApiResponseDTO, MusicApiCodes } from '../codes.js';

/**
 * Cross library controller — **company-scoped** (not platform-scoped).
 *
 * This endpoint reads the music libraries of ALL artists under contract
 * at a given company and builds a cross-reference matrix. It requires
 * a company contract because the caller needs to be authorized to view
 * the company's roster and their libraries.
 *
 * The data flow bridges the two contract types:
 * - Company contract → "who are my artists?" (roster)
 * - Platform contract (of each artist) → "what songs do they know?"
 *
 * The result is a matrix where rows = songs, columns = artists,
 * cells = whether the artist has that song + their version details.
 */
@ApiTags('music / cross library')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'Authentication required.' })
@ContractScoped()
@Controller()
export class MusicCrossLibraryController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    summary: 'Get cross library for a company',
    description: 'Returns the cross-reference matrix of songs × artists for all artists under active contract at the given company. Sorted by compatibleCount (most-shared songs first).',
  })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @RequirePermission(P.Company.Members.Read)
  @Get(':id/cross-library')
  async getCrossLibrary(
    @Param('id') companyId: TCompanyId,
  ): Promise<TApiResponse<TCrossSearchResult>> {
    const result = await this.queryBus.execute<GetCompanyCrossLibraryQuery, TCrossSearchResult>(
      new GetCompanyCrossLibraryQuery(companyId),
    );
    return buildApiResponseDTO(MusicApiCodes.CROSS_LIBRARY_FETCHED, result);
  }
}
