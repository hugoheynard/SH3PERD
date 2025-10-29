import { ApiExtraModels } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { SContractListItemViewModel } from '@sh3pherd/shared-types';

@ApiExtraModels()
export class ContractListItemDTO extends createZodDto(SContractListItemViewModel) {}