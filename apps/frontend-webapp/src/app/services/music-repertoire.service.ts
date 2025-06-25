import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {ApiURLService} from './api-url.service';
import {IMusicTabConfig} from '../pages/musicLibrary/types/IMusicTabConfig';
import {TUserId} from '../../types/user.types';

@Injectable({
  providedIn: 'root'
})
export class MusicRepertoireService {
  private http: HttpClient = inject(HttpClient);
  private apiURLService: ApiURLService = inject(ApiURLService);
  private baseURL: string = this.apiURLService.api().protected().build();

  public musicRepertoire: WritableSignal<any[]> = signal<any[]>([]);


  async executeConfigStrategy(input: { config: IMusicTabConfig }): Promise<any[]> {
    if (!input || !input.config || !input.config.searchConfiguration) {
      console.warn('Invalid input or missing searchConfiguration');
      return [];
    }

    const { searchMode, target } = input.config.searchConfiguration;

    if (searchMode === 'repertoire') {
      switch (target.mode) {
        case 'me':
          return await this.getMusicRepertoire_Me();

        case 'single-user':
          const user_id = target.singleUser_id;

          if (user_id) {
            return await this.getMusicRepertoire_SingleUser(user_id);
          }
          console.warn('Missing userId for singleUser targetMode');
          return [];

        case 'multiple-users':
          const userIds = target.multipleUsers_id;

          if (!userIds || userIds.length === 0) {
            console.warn('Missing userIds for multipleUsers targetMode');
            return [];
          }
          return await this.getMusicRepertoire_MultipleUsers(userIds);
      }
    }

    console.warn('Unsupported searchMode or targetMode');
    return [];
  };




  /**
   * Fetches the user's music repertoire - default on the page initialization.
   */
  async getMusicRepertoire_Me(filter?: any): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicRepertoire/me`, {
            filter: filter || {}
          },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }))

      if (!response.ok) {
        return false;
      }
      const result: any = Object.values(response.body)[0];
      this.musicRepertoire.set(result);
      return result;

    } catch(e) {
      console.log('error while getting music library', e);
      return false;
    }
  };

  async getMusicRepertoire_SingleUser(user_id: TUserId): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicRepertoire/`,
          {
            target_id: user_id
          },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }))

      if (!response.ok) {
        return false;
      }
      const result: any = Object.values(response.body)[0];
      this.musicRepertoire.set(result);
      return result;

    } catch(e) {
      console.log('error while getting music library', e);
      return false;
    }
  };

  async getMusicRepertoire_MultipleUsers(user_ids: TUserId[]): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicRepertoire/`,
          {
            target_ids: [...user_ids]
          },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }))

      if (!response.ok) {
        return false;
      }
      const result: any = Object.values(response.body)[0];
      this.musicRepertoire.set(result);
      return result;

    } catch(e) {
      console.log('error while getting music library', e);
      return false;
    }
  };




















  async postMusic(input: { formData: Record<'title' | 'artist', string> }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicLibrary/music`,
          { data: { ...input.formData } },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      return response.ok;

    } catch(e) {
      console.log('Song addition went wrong', e);
      return false;
    }
  };

  async deleteMusic(input: { music_id: string }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.delete(
          `${this.baseURL}/musicLibrary/music/${input.music_id}`,
          { observe: 'response' })
      );

      return response.ok;

    } catch(e){
      console.log('error while deleting music', e);
      return false;
    }
  };

  async postVersion(input: { referenceMusic_id: string; versionData: any }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicLibrary/version`,
          {
            referenceMusic_id: input.referenceMusic_id,
            versionData: input.versionData
          },
          { observe: 'response' }
        )
      );
      return response.ok;
    } catch(e) {
      console.log('error while posting new version', e);
      return false;
    }
  };

  async updateVersion(input: { version_id: string; versionData: any}): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.put(
          `${this.baseURL}/musicLibrary/version/${input.version_id}`,
          { versionData: input.versionData},
          { observe: 'response' }
        )
      );
      return response.ok;
    } catch(e) {
      console.log('error while updating version', e);
      return false;
    }
  };

  async deleteVersion(input: { version_id: string }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.delete(
          `${this.baseURL}/musicLibrary/version/${input.version_id}`,
          { observe: 'response' })
      );

      return response.ok;
    } catch(e){
      console.log('error while deleting version', e);
      return false;
    }
  };
}
