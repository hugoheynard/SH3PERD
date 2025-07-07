import type {  TSaveOneMusicReferenceFn } from '../types/musicReferences.types.js';
import type { TCreateMusicReferencePayload, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import type { TUserId } from '../../user/types/user.domain.types.js';
import { BusinessError } from '../../utils/errorManagement/errorClasses/BusinessError.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import type { ClientSession } from 'mongodb';


/**
 * Use case factory -> postMusicReferenceUseCase.
 * @param deps
 */
export const createPostMusicReferenceUseCase =  (deps: {
  saveOneMusicReferenceFn: TSaveOneMusicReferenceFn;
}) => {
  /**
   * Use case to create a new music reference.
   * @param {Object} input - The input data for the use case.
   * @return {Promise<TMusicReferenceDomainModel>} - A promise that resolves when the music reference is created.
   */
  const { saveOneMusicReferenceFn } = deps;

  return async (
    asker_id: TUserId,
    payload: TCreateMusicReferencePayload,
    session?: ClientSession
  ): Promise<TMusicReferenceDomainModel> => {
    try {
      const { title, artist } = payload;

      if (!title || !artist) {
        throw new BusinessError('Title and artist are required fields.', 'INVALID_PAYLOAD', 400);
      }

      const dateNow: Date = new Date();

      const musicReferenceObject: TMusicReferenceDomainModel = {
        music_id: `musicReference_${crypto.randomUUID()}`,
        title,
        artist,
        created_at: dateNow,
        updated_at: dateNow,
        created_by: asker_id,
        active: true
      };

      const result = await saveOneMusicReferenceFn(musicReferenceObject, session);

      if (!result) {
        throw new TechnicalError('Failed to create music reference.', 'MUSIC_REFERENCE_CREATION_ERROR', 500);
      }

      return musicReferenceObject;

    } catch(error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error while creating music reference');
    }
  }
}