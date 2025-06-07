import {Injectable, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryTextContentService {
  public static readonly TEXT_CONTENT: any = {
    musicAttributes: {
      genres: ['pop', 'rock', 'soul', 'edm', 'ethnic', 'jazz'],
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

}
