import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { TCreateContractRequestDTO, TGetContractsByFilterRequestDTO} from '@sh3pherd/shared-types';
import { CONTRACTS_USE_CASES } from '../contracts.tokens.js';
import type { TContractsUseCases } from '../useCase/ContractUseCasesFactory.js';
import { /*ContractScopedContext,*/ UserScopedContext } from '../../utils/nest/decorators/Context.js';
import type { TUseCaseContext } from '../../types/useCases.generic.types.js';
import { ApiOkResponse } from '@nestjs/swagger';
import { ContractListItemDTO } from '../dto/ContractListItemDTO.js';


@Controller()
export class ContractController {
  constructor(
    @Inject(CONTRACTS_USE_CASES) private readonly contractsUC: TContractsUseCases
  ) {};


  /**
   * Endpoint to get contracts for the current user based on provided filters.
   * Returns a list of contracts matching the filter criteria, scoped to the current user.
   * @param context
   * @param requestDTO
   */
  @ApiOkResponse({
    description: 'Successfully retrieved contracts for the current user.',
    type: [ContractListItemDTO]
  })
  @Post('me')
  getCurrentUserContractList(
    @Body() requestDTO: TGetContractsByFilterRequestDTO,
    @UserScopedContext() context: TUseCaseContext<'unscoped'>,
  ): Promise<any> {
    return this.contractsUC.getCurrentUserContractList({ context, requestDTO });
  };


  /**
   * Endpoint to create a new contract.
   */
  @Post()
  createContract(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: TCreateContractRequestDTO,
    //@ContractScopedContext() context: TUseCaseContext<'scoped'>,
  ) {
    return this.contractsUC.create(requestDTO, req.user_id);
  };

  /*
  @Post('favorite')
  favoriteContract(
    @Req() req: Request,
    @Body('contract_id') contract_id: TContractId,
  ) {
    return this.uc.favorite(contract_id, req.user_id);
  };*/


}
