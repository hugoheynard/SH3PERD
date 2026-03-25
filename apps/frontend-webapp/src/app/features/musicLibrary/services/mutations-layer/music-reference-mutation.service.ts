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
      title: '',
      originalArtist: '',
    };
  }

  addReference(title: string, originalArtist: string): MusicReference {
    const ref: MusicReference = {
      id: crypto.randomUUID(),
      title: title.trim(),
      originalArtist: originalArtist.trim(),
    };
    this.add(ref);
    return ref;
  }
}
