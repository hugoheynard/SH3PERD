//import type { ClientSession } from 'mongodb';


/**
 * Use case to create a new music version.
 * @param deps
 */
/**
const createPostMusicVersionUseCase = (deps: {
  postMusicReferenceUseCase: any; // TCreatePostMusicReferenceUseCase
  createMusicRepertoireEntryUseCase: any; // TCreateMusicRepertoireEntryUseCase
  session: ClientSession
}) => {
  const { postMusicReferenceUseCase, session } = deps;

  return (payload, asker_id: any): any => {

     *


    // if mapToTrackEnabled and no referenceMusic_id :
    const newReferenceMusic = await postMusicReferenceUseCase(payload.referenceMusicCreationPayload, session);



  }
}*/