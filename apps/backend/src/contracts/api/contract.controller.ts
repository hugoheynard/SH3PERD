import { Body, Controller, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import type {
  TCompanyId,
  TContractId,
  TCreateContractRequestDTO,
  TGetContractsByFilterRequestDTO,
  TUpdateContractDTO,
} from '@sh3pherd/shared-types';
import { CONTRACTS_USE_CASES } from '../contracts.tokens.js';
import type { TContractsUseCases } from '../useCase/ContractUseCasesFactory.js';
import { UserScopedContext } from '../../utils/nest/decorators/Context.js';
import type { TUseCaseContext } from '../../types/useCases.generic.types.js';
import { ApiOkResponse } from '@nestjs/swagger';
import { ContractListItemDTO } from '../dto/ContractListItemDTO.js';

@Controller()
export class ContractController {
  constructor(
    @Inject(CONTRACTS_USE_CASES) private readonly contractsUC: TContractsUseCases,
  ) {}

  @ApiOkResponse({ description: 'Current user contracts', type: [ContractListItemDTO] })
  @Post('me')
  getCurrentUserContractList(
    @Body() requestDTO: TGetContractsByFilterRequestDTO,
    @UserScopedContext() context: TUseCaseContext<'unscoped'>,
  ) {
    return this.contractsUC.getCurrentUserContractList({ context, requestDTO });
  }

  @Get('company/:companyId')
  getCompanyContracts(@Param('companyId') companyId: TCompanyId) {
    return this.contractsUC.getCompanyContracts(companyId);
  }

  @Get(':contractId')
  getContractById(@Param('contractId') contractId: TContractId) {
    return this.contractsUC.getContractById(contractId);
  }

  @Patch(':contractId')
  updateContract(
    @Param('contractId') contractId: TContractId,
    @Body() dto: Omit<TUpdateContractDTO, 'contract_id'>,
  ) {
    return this.contractsUC.updateContract({ ...dto, contract_id: contractId });
  }

  @Post()
  createContract(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: TCreateContractRequestDTO,
  ) {
    return this.contractsUC.create(requestDTO, req.user_id);
  }
}
