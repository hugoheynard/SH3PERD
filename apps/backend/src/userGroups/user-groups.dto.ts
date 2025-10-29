import { ApiExtraModels } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { SUserGroupListViewModel } from '@sh3pherd/shared-types';


@ApiExtraModels()
export class UserGroupListDTO extends createZodDto(SUserGroupListViewModel) {}