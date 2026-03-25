import { Injectable } from '@angular/core';
import { BaseMusicItemCRUD } from './BaseMusicItemCRUD';
import type { MusicVersion } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class MusicVersionMutationService extends BaseMusicItemCRUD<'versions'> {

  constructor() {
    super('versions');
  }

  protected createDefault(_input: unknown): MusicVersion {
    return {
      id: crypto.randomUUID(),
      referenceId: '',
      label: 'New Version',
    };
  }

  /**
   * Adds a new version for a given reference.
   */
  addVersion(referenceId: string, label: string, notes?: string): void {
    this.add({
      id: crypto.randomUUID(),
      referenceId,
      label,
      notes,
    });
  }

  /**
   * Updates the label of a version.
   */
  updateLabel(id: string, label: string): void {
    this.patch(id, item => ({ ...item, label } as MusicVersion));
  }

  /**
   * Updates the notes of a version.
   */
  updateNotes(id: string, notes: string): void {
    this.patch(id, item => ({ ...item, notes } as MusicVersion));
  }
}
