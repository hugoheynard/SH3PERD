import { Injectable } from '@angular/core';
import { BaseMusicItemCRUD } from './BaseMusicItemCRUD';
import type { MusicReference } from '../../music-library-types';

@Injectable({ providedIn: 'root' })
export class MusicReferenceMutationService extends BaseMusicItemCRUD<'references'> {

  constructor() {
    super('references');
  }

  protected createDefault(_input: unknown): MusicReference {
    return {
      id: crypto.randomUUID(),
      title: 'New Reference',
      originalArtist: '',
      genre: [],
    };
  }

  /**
   * Adds a new music reference with auto-generated ID.
   */
  addReference(reference: Omit<MusicReference, 'id'>): void {
    this.add({
      id: crypto.randomUUID(),
      ...reference,
    });
  }

  /**
   * Updates the genres of a reference.
   */
  updateGenres(id: string, genre: string[]): void {
    this.patch(id, item => ({ ...item, genre } as MusicReference));
  }

  /**
   * Updates the BPM of a reference.
   */
  updateBpm(id: string, bpm: number): void {
    this.patch(id, item => ({ ...item, bpm } as MusicReference));
  }
}
