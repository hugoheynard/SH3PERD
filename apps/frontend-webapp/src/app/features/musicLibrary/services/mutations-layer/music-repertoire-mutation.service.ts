import { Injectable } from '@angular/core';
import { BaseMusicItemCRUD } from './BaseMusicItemCRUD';
import type { Rating, RepertoireEntry } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class MusicRepertoireMutationService extends BaseMusicItemCRUD<'repertoire'> {

  constructor() {
    super('repertoire');
  }

  protected createDefault(_input: unknown): RepertoireEntry {
    return {
      id: crypto.randomUUID(),
      referenceId: '',
      userId: 'user_me',
      mastery: 1,
      energy: 1,
      effort: 1,
    };
  }

  /**
   * Upserts a repertoire entry for the given referenceId and userId.
   * If an entry already exists for that pair, it is updated; otherwise a new one is added.
   */
  upsertEntry(
    referenceId: string,
    userId: string,
    ratings: { mastery: Rating; energy: Rating; effort: Rating }
  ): void {
    const currentState = this.state.library();
    const existing = currentState.repertoire.find(
      e => e.referenceId === referenceId && e.userId === userId
    );

    if (existing) {
      this.patch(existing.id, item => ({
        ...item,
        mastery: ratings.mastery,
        energy: ratings.energy,
        effort: ratings.effort,
      } as RepertoireEntry));
    } else {
      this.add({
        id: crypto.randomUUID(),
        referenceId,
        userId,
        mastery: ratings.mastery,
        energy: ratings.energy,
        effort: ratings.effort,
      });
    }
  }

  /**
   * Removes a repertoire entry for the given referenceId and userId.
   */
  removeEntry(referenceId: string, userId: string): void {
    this.state.updateState(state => ({
      ...state,
      repertoire: state.repertoire.filter(
        e => !(e.referenceId === referenceId && e.userId === userId)
      ),
    }));
  }
}
