import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {firstValueFrom} from 'rxjs';
import {savePlaylist} from './savePlaylist';
import {getNewEmptyPlaylistObject} from './getNewEmptyPlaylistObject';
import {getPlaylists} from './getPlaylists';
import {updatePlaylist} from './updatePlaylist';
import {deletePlaylist} from './deletePlaylist';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private http: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.baseURL;

  async getPlaylists(): Promise<any> {
    return await getPlaylists(
      {
        http: this.http,
        url: `${this.baseUrl}/playlist/`
      });
  };

  async savePlaylist(input: { playlistData: any }): Promise<any> {
    return await savePlaylist(
      {
        http: this.http,
        url: `${this.baseUrl}/playlist/`,
        playlistData: input.playlistData
      });
  };

  async updatePlaylist(input: { playlistData: any; playlist_id: string; }): Promise<any> {
    return await updatePlaylist(
      {
        http: this.http,
        url: `${this.baseUrl}/playlist/${input.playlist_id}`,
        playlistData: input.playlistData,
      });
  };

  async deletePlaylist(input: { playlist_id: string }): Promise<any> {
    return await deletePlaylist(
      {
        http: this.http,
        url: `${this.baseUrl}/playlist/${input.playlist_id}`
      }
    )
  };

  /**
   * * Create a new empty playlist by getting a default playlist object from the backend
   */
  async createNewEmptyPlaylist(): Promise<any> {
      return await getNewEmptyPlaylistObject(
        {
          http: this.http,
          url: `${this.baseUrl}/playlist/new`
        });
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
