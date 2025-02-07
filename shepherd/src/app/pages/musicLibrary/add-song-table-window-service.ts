import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddSongTableWindowService {
  public songTableVisibleSignal: WritableSignal<boolean> = signal(false);
  public addVersionTr: WritableSignal<boolean> = signal(false);

  open(): void {
    this.songTableVisibleSignal.set(true);
  };

  close(): void {
    this.songTableVisibleSignal.set(false);
  };

  toggle(): void {
    this.songTableVisibleSignal.update(state => !state);
  };
}
