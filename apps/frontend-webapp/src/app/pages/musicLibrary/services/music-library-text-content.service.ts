import {Injectable, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryTextContentService {
  public readonly TEXT_CONTENT: any = {
    musicAttributes: {
      genres: [{ label: 'pop', value: 'pop' }, { label: 'rock', value: 'rock' }, { label: 'soul/disco', value: 'soul/disco' }, { label: 'edm', value: 'edm' }, { label: 'ethnic', value: 'ethnic' }, { label: 'jazz', value: 'jazz' }, { label: 'various', value: 'various' }],
      types: [{ label: 'original', value: 'original' }, { label: 'cover', value: 'cover' }, { label: 'remix', value: 'remix' }, { label: 'acoustic', value: 'acoustic' }],
      keys: [
        {
          key: 'C',
          alteration: ['#'],
          tone: ['minor', 'major'],
        },
        {
          key: 'D',
          alteration: ['b', '#'],
          tone: ['minor', 'major'],
        },
        {
          key: 'G',
          alteration: ['b', '#'],
          tone: ['minor', 'major'],
        },
        {
          key: 'A',
          alteration: ['b', '#'],
          tone: ['minor', 'major'],
        },
      ],
      energy: {
        min: 1,
        max: 4
      },
      effort: {
        min: 1,
        max: 4
      },
      mastery: {
        min: 1,
        max: 4
      },
    },
    musicTabConfigurator: {

    }

  }

  getArrayFromRange(min: number, max: number): number[] {
    return Array.from({length: max - min + 1}, (_, i) => i + min);
  };

  arrayToSelectObjArray(array: (string | number)[]): any[] {
    return array.map(a => ({ label: a.toString(), value: a }))
  };

  get1_4Array() {
    const base: any[] = this.getArrayFromRange(1, 4);
    return this.arrayToSelectObjArray(base);
  };

  getGenreOptions(): { label: string; value: string | number | null }[] {
    return this.TEXT_CONTENT.musicAttributes.genres
  }

  getTypeOptions(): { label: string; value: string | number | null }[] {
    return this.TEXT_CONTENT.musicAttributes.types;
  }
}
