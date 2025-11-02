import { SUserMeViewModel } from '@sh3pherd/shared-types';
import { ApiModel } from '../../utils/swagger/api-model.swagger.util.js';
import { createZodDto } from 'nestjs-zod';


/**
 * DTO representing the current user's profile and preferences.
 * derived from SUserMeViewModel schema.
 * structure : { id: TUserId, profile: {...}, preferences: {...} }
 */
@ApiModel()
export class UserMeViewModelPayload extends createZodDto(SUserMeViewModel) {}