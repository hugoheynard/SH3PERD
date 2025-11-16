import { createZodDto } from 'nestjs-zod';
import { SUserGroupListViewModel, SSubgroupInitialFormValuesObject } from '@sh3pherd/shared-types';
import { ApiModel } from '../../../utils/swagger/api-model.swagger.util.js';


@ApiModel()
export class UserGroupListDTO extends createZodDto(SUserGroupListViewModel) {}

@ApiModel()
export class SubgroupInitialFormValuesObjectDTO extends createZodDto(SSubgroupInitialFormValuesObject) {}

