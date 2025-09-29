import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import { type TCoreUseCasesTypeMap, USE_CASES_TOKENS } from '../../appBootstrap/nestTokens.js';
import type { Request } from 'express';
import type { TCreateContractRequestDTO, TGetContractsByFilterRequestDTO } from '@sh3pherd/shared-types';


@Controller('contract')
export class ContractController {
  constructor(
    @Inject(USE_CASES_TOKENS.contracts)
    private readonly uc: TCoreUseCasesTypeMap['contracts']) {}

  /**
   * Endpoint to get contracts for the current user based on provided filters.
   * Gets the user_id from the request object and merges it with any filters provided in the request body.
   * @param req
   * @param requestDTO
   */
  @Post('me')
  getCurrentUserContracts(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: TGetContractsByFilterRequestDTO
  ) {
    const { filter } = requestDTO || {};

    return this.uc.getContractsByFilter({
      asker_id:  req.user_id,
      filter: { ...filter, user_id: req.user_id },
    });
  };


  /**
   * Endpoint to create a new contract.
   * @param req
   * @param requestDTO
   */
  @Post()
  createContract(
    @Req() req: Request,
    @Body('requestDTO') requestDTO: TCreateContractRequestDTO
  ) {
    return this.uc.create(requestDTO, req.user_id);
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
