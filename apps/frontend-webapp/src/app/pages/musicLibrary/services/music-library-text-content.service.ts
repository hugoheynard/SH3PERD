import {Injectable, WritableSignal} from '@angular/core';
import {
  ALTERATION_KEY_MAP,
  MUSIC_GRADE_VALUES,
  SGenreEnum, SMusicNoteEnum,
  SToneEnum,
  STypeEnum,
  TAlterationEnum, TMusicNoteEnum, TToneEnum,
} from '@sh3pherd/shared-types';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryTextContentService {
  getMusicGradeArray() {
    return MUSIC_GRADE_VALUES.map((grade: number) => ({ label: grade.toString(), value: grade }));
  };

  getGenreOptions(): { label: string; value: string | number | null }[] {
    return SGenreEnum
      .options
      .map((genre: string) => ({ label: genre, value: genre }));
  };

  getTypeOptions(): { label: string; value: string | number | null }[] {
    return STypeEnum
      .options
      .map((type: string) => ({ label: type, value: type }))
  };

  getKeysNote(): { label: string; value: string | number | null }[] {
    return SMusicNoteEnum
      .options
      .map((note: TMusicNoteEnum) => ({ label: note, value: note}));
  };

  getKeysAlterations(note: TMusicNoteEnum): { label: string; value: string | number | null }[] {

    return ALTERATION_KEY_MAP[note]
      .map((alt: TAlterationEnum) => ({ label: alt, value: alt } ));
  };

  getKeysTone(): { label: string; value: string | number | null }[] {
    return SToneEnum
      .options
      .map((tone: TToneEnum) => ({ label: tone, value: tone}));
  }
}

