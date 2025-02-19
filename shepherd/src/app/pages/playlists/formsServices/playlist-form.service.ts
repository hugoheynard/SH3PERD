import {inject, Injectable} from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PlaylistFormService {
  private fb: FormBuilder = inject(FormBuilder);
  public playlistForm!: FormGroup;

  /** Crée le FormGroup pour la playlist */
  createPlaylistForm(playlist: any = {}): FormGroup {
    this.playlistForm = this.fb.group({
      energy: [playlist.energy || 1],
      settings: this.createSettingsFormGroup(playlist),
      songList: this.createSongListFormArray(playlist),
      notes: [playlist.notes || '']
    });
    return this.playlistForm;
  };

  /** Crée un FormGroup pour une chanson */
  createSongFormGroup(song: any = {}): FormGroup {
    return this.fb.group({
      _id: [song._id || ''],
      title: [song.title || ''],
      artist: [song.artist || ''],
      tags: this.fb.array(song.tags || [])
    });
  };

  createSettingsFormGroup(playlist: any = {}): FormGroup {
    return this.fb.group({
      name: [playlist?.settings.name || 'New Playlist'],
      usage: [playlist?.settings.type || 'Daily'],
      requiredLength: [playlist?.settings.requiredLength || 15],
      numberOfSongs: [playlist?.settings.numberOfSongs || 4],
      containsAerial: [playlist?.settings.containsAerial || false],
      containsDuo: [playlist?.settings.containsDuo || false],
    });
  };

  createSongListFormArray(playlist: any = {}): FormArray {
    return this.fb.array(playlist.songList?.map((song: any) => this.createSongFormGroup(song)) || [])
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
}
