import type { TMusicGrade, TMusicRepertoireEntryDomainModel, TMusicVersionId, TUserId } from '@sh3pherd/shared-types';


export const createAddMusicRepertoireEntryUseCase  = (deps: {
  saveOneMusicRepertoireEntryFn: (entry: TMusicRepertoireEntryDomainModel) => Promise<boolean>;
}) => {
  return async (input:{
    asker_id: TUserId;
    target_id: TUserId;
    musicVersion_id: TMusicVersionId;
    entryData : {
      energy: TMusicGrade;
      effort: TMusicGrade;
      mastery: TMusicGrade;
      affinity: TMusicGrade;
    };
  }): Promise<TMusicRepertoireEntryDomainModel> => {
    try {
      const { asker_id, target_id, musicVersion_id, entryData } = input;

      const dateNow: Date = new Date();

      const newEntry: TMusicRepertoireEntryDomainModel = {
        musicVersion_id,
        user_id: target_id,
        energy: entryData.energy,
        effort: entryData.effort,
        mastery: entryData.mastery,
        affinity: entryData.affinity,
        created_at: dateNow,
        updated_at: dateNow,
        created_by: asker_id
      };

      const result = await deps.saveOneMusicRepertoireEntryFn(newEntry);

      if (!result) {
        throw new Error('Failed to save music repertoire entry');
      }

      return newEntry;
    } catch (error) {
      console.error('Error in createAddMusicRepertoireEntryUseCase:', error);
      throw new Error('Failed to create music repertoire entry');
    }

  }
}