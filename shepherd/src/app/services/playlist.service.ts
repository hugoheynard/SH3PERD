import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.baseURL;

  savePlaylist(input: { data: any}): any {
    console.log('hello', input.data)
  };

  async createNewEmptyPlaylist(): Promise<any> {
    try{
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/playlist/new`,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      if (!response.ok) {
        console.error('Error creating new empty playlist');
      }
      return response.body.playlist;
    } catch(err) {
      console.error(err);
    }
  };

  async createNewEmptyPlaylistFromTemplate(input: { playlistTemplate_id?: string }): Promise<any> {
    console.log('3-I am the service')
    console.log('4-I get playlistTemplate_id:', input.playlistTemplate_id);
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/playlist/`,
          { playlistTemplate_id: input.playlistTemplate_id },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      if (!response.ok) {

      }
      console.log(response)
      return response;


    } catch(err) {
      console.error(err);
    }


  };
}
