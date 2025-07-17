import type { TMusicVersionCreationFormPayload, TMusicVersionDomainModel, TUserId } from '@sh3pherd/shared-types';
import { RecordMetadataUtils } from '../../utils/metaData/RecordMetadataUtils.js';
import { TechnicalError } from '../../utils/errorManagement/errorClasses/TechnicalError.js';
import { apiCodes } from '../codes.js';


export type TCreateOneMusicVersionUseCase = (input: {
  asker_id: TUserId;
  payload: TMusicVersionCreationFormPayload
}) => Promise<TMusicVersionDomainModel>;

export const createCreateOneMusicVersionUseCase = (deps: {
  saveOneMusicVersionFn: (document: TMusicVersionDomainModel) => Promise<boolean>;
}): TCreateOneMusicVersionUseCase => {
  const { saveOneMusicVersionFn } = deps;

  return async (input) => {
    try {
      const { payload, asker_id } = input;

      const newVersion: TMusicVersionDomainModel = {
        ...payload,
        owner_id: asker_id,
        metadata: RecordMetadataUtils.create(asker_id),
      };

      const result = await saveOneMusicVersionFn(newVersion);

      if (!result) {
        throw new Error('Failed to create music version');
      }

      return newVersion;
    } catch (error) {
      throw new TechnicalError(
        apiCodes.music.MUSIC_VERSION_CREATION_UC_FAIL.message,
        apiCodes.music.MUSIC_VERSION_CREATION_UC_FAIL.code,
        500
      );
    }
  }
}