import { Injectable } from '@angular/core';
import { BaseMusicItemCRUD } from './BaseMusicItemCRUD';
import type { RepertoireEntry } from '../../music-library-types';

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
    };
  }

  /**
   * Adds a repertoire entry linking a reference to a user.
   * No-op if the entry already exists.
   */
  addEntry(referenceId: string, userId: string = 'user_me'): RepertoireEntry | null {
    const existing = this.state.library().repertoire.find(
      e => e.referenceId === referenceId && e.userId === userId
    );
    if (existing) return null;

    const entry: RepertoireEntry = {
      id: crypto.randomUUID(),
      referenceId,
      userId,
    };
    this.add(entry);
    return entry;
  }

  removeEntry(referenceId: string, userId: string = 'user_me'): void {
    this.state.updateState(state => ({
      ...state,
      repertoire: state.repertoire.filter(
        e => !(e.referenceId === referenceId && e.userId === userId)
      ),
    }));
  }
}
