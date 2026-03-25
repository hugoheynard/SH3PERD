import { Body, Controller, Get, Inject, Param, Post, Delete } from '@nestjs/common';
import { UserScopedContext } from '../../utils/nest/decorators/Context.js';
import type { TUseCaseContext } from '../../types/useCases.generic.types.js';
import { COMPANY_USE_CASES } from '../company.tokens.js';
import type { TCompanyUseCases } from '../useCase/CompanyUseCasesFactory.js';
import type { TCreateCompanyDTO } from '../useCase/company/CreateCompanyUseCase.js';
import type { TCreateCastDTO } from '../useCase/cast/CreateCastUseCase.js';
import type { TAddCastMemberDTO } from '../useCase/cast/AddCastMemberUseCase.js';
import type { TRemoveCastMemberDTO } from '../useCase/cast/RemoveCastMemberUseCase.js';
import type { TCastId } from '@sh3pherd/shared-types';

@Controller()
export class CompanyController {
  constructor(
    @Inject(COMPANY_USE_CASES) private readonly uc: TCompanyUseCases,
  ) {}

  // ── Company ────────────────────────────────────────

  @Post()
  createCompany(
    @Body() dto: TCreateCompanyDTO,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    return this.uc.createCompany(dto, ctx.user_scope);
  }

  // ── Cast ───────────────────────────────────────────

  @Post('casts')
  createCast(
    @Body() dto: TCreateCastDTO,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    return this.uc.createCast(dto, ctx.user_scope);
  }

  @Get('casts/:castId/members')
  getCastMembers(
    @Param('castId') castId: TCastId,
  ) {
    return this.uc.getCastMembers({ cast_id: castId });
  }

  @Get('casts/:castId/members/at/:date')
  getCastMembersAt(
    @Param('castId') castId: TCastId,
    @Param('date') date: string,
  ) {
    return this.uc.getCastMembers({ cast_id: castId, at: new Date(date) });
  }

  @Post('casts/:castId/members')
  addCastMember(
    @Param('castId') castId: TCastId,
    @Body() body: Omit<TAddCastMemberDTO, 'cast_id'>,
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    return this.uc.addCastMember({ ...body, cast_id: castId }, ctx.user_scope);
  }

  @Delete('casts/:castId/members/:userId')
  removeCastMember(
    @Param('castId') castId: TCastId,
    @Param('userId') userId: string,
    @Body() body: { reason?: string },
    @UserScopedContext() ctx: TUseCaseContext<'unscoped'>,
  ) {
    const dto: TRemoveCastMemberDTO = { cast_id: castId, user_id: userId as any, reason: body?.reason };
    return this.uc.removeCastMember(dto, ctx.user_scope);
  }
}
