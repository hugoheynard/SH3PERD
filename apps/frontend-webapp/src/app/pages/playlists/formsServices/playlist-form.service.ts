import {inject, Injectable} from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PlaylistFormService {
  private fb: FormBuilder = inject(FormBuilder);
  public playlistForm: FormGroup = {} as FormGroup;

  /** Crée le FormGroup pour la playlist */
  createPlaylistForm(playlist: any = {}): FormGroup {
    if (!playlist) {
      console.error('Playlist is undefined!');
      return this.fb.group({});
    }
    const { settings, songList, performers } = playlist;

    this.playlistForm = this.fb.group({
      settings: this.createSettingsFormGroup(settings),
      performers: this.createPerformersFormGroup(performers),
      tags: playlist.tags,
      songList: this.createSongListFormArray(songList),
    });
    return this.playlistForm;
  };

  createPerformersFormGroup(performers: any = {}): FormGroup {
    const { singersConfig, musiciansConfig, aerialConfig } = performers;

     return this.fb.group({
       singersConfig: this.fb.group({
        numberOfSingers: singersConfig.singers,
        containsDuo: singersConfig.containsDuo,
        splitMode: singersConfig.splitMode,
       }),
        musiciansConfig: this.fb.group({
          //numberOfMusicians: musiciansConfig.musicians,
        }),
       aerialConfig: this.fb.group({
         performancePosition: [performers.aerialConfig.performancePosition],
       })
     })
  };



  createSettingsFormGroup(settings: any = {}): FormGroup {
    return this.fb.group({
      name: [settings.name],
      description: [settings.description],
      usage: [settings.usage],
      energy: [settings.energy],
      requiredLength: [settings.requiredLength],
      numberOfSongs: [settings.numberOfSongs],
      singers: [settings.singers],
      musicians: [settings.musicians],
      aerial: [settings.aerial],
    });
  };


  /** Crée un FormGroup pour une chanson */
  createSongFormGroup(song: any = {}): FormGroup {
    return this.fb.group({
      _id: [song._id || ''],
      title: [song.label || ''],
      artist: [song.artist || ''],
      tags: this.fb.array(song.tags || [])
    });
  };

  createSongListFormArray(songList: any = {}): FormArray {
    return this.fb.array(songList?.map(
      (song: any) => this.createSongFormGroup(song)) || [])
  };

  /** Gets song FormArray */ //OK
  getSongList(): FormArray {
    return this.playlistForm.get('songList') as FormArray;
  };

  getSettings(): FormGroup {
    return this.getForm().get('settings') as FormGroup;
  };

  /** Add song to song FormArray */ //OK
  addSong(song: any = {}): void {
    this.getSongList().push(this.createSongFormGroup(song));
  };

  /** Deletes a song by index */
  removeSong(index: number): void {
    this.getSongList().removeAt(index);
  };

  updateFormArray(formArray: FormArray, newOrder: FormGroup[]): void {
    formArray.setValue(newOrder.map(control => control.value));
  };

  /**
   * Manages tags depending on the settings
   * */
  getAvailableTags(): string[] {
    let result: string[] = []
    const settings = this.getSettings().value;

    if (settings.containsAerial) {
      result.push('aerial');
    }

    if (settings.containsDuo) {
      result.push('duo');
    }

    return result;
  };


  getForm(): FormGroup {
    return this.playlistForm;
  };

  getValues(): any {
    return this.playlistForm.value;
  };
}
