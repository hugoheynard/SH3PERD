import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddSongTableWindowService {
  public songTableVisibleSignal: WritableSignal<boolean> = signal(false);
  public addVersionTrSignal: WritableSignal<boolean> = signal(false);

  open(): void {
    this.songTableVisibleSignal.set(true);
  };

  close(): void {
    this.songTableVisibleSignal.set(false);
  };

  toggle(): void {
    this.songTableVisibleSignal.update(state => !state);
  };

  openAddVersionTr(): void {
    this.addVersionTrSignal.set(true);
  };

  closeAddVersionTr(): void {
    this.addVersionTrSignal.set(false);
  };

}
