import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private http: HttpClient = inject(HttpClient);

  savePlaylist(input: { data: any}): any {
    console.log('hello', input.data)
  };
}
