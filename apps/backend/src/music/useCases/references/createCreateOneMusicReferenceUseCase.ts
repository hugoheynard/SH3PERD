import type {  TSaveOneMusicReferenceFn } from '../../types/musicReferences.types.js';
import type {
  TCreateMusicReferenceRequestDTO,
  TMusicReferenceDomainModel,
  TUserId
} from '@sh3pherd/shared-types';
import { BusinessError } from '../../../utils/errorManagement/errorClasses/BusinessError.js';
import { TechnicalError } from '../../../utils/errorManagement/errorClasses/TechnicalError.js';
import { RecordMetadataUtils } from '../../../utils/metaData/RecordMetadataUtils.js';


/**
 * Use case factory -> postMusicReferenceUseCase.
 * @param deps
 */
export const createCreateOneMusicReferenceUseCase =  (deps: {
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
    payload: TCreateMusicReferenceRequestDTO
  ): Promise<TMusicReferenceDomainModel> => {
    try {
      const { title, artist } = payload;

      if (!title || !artist) {
        throw new BusinessError('Title and artist are required fields.', 'INVALID_PAYLOAD', 400);
      }

      const musicReferenceObject: TMusicReferenceDomainModel = {
        musicReference_id: `musicReference_${crypto.randomUUID()}`,
        title,
        artist,
        metadata: RecordMetadataUtils.create(asker_id),
      };

      const result = await saveOneMusicReferenceFn(musicReferenceObject);

      if (!result) {
        throw new TechnicalError('Failed to create music reference.', 'MUSIC_REFERENCE_CREATION_ERROR', 500);
      }

      return musicReferenceObject;

    } catch(error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new TechnicalError('Unknown error while creating music reference', 'UNKNOWN_ERROR_CREATE_ONE_MUSIC_REFERENCE', 500);
    }
  }
}