import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InsertLineService {

  private _minutes = signal<number | null>(null);
  private _roomId = signal<string | null>(null);
  private _multiRoom = signal(false);

  minutes = this._minutes.asReadonly();
  roomId = this._roomId.asReadonly();
  multiRoom = this._multiRoom.asReadonly();

  set(minutes: number, roomId: string, multiRoom: boolean) {
    this._minutes.set(minutes);
    this._roomId.set(roomId);
    this._multiRoom.set(multiRoom);
  }

  clear() {
    this._minutes.set(null);
    this._roomId.set(null);
    this._multiRoom.set(false);
  }

}
