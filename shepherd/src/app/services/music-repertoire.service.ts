import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {ApiURLService} from './api-url.service';

@Injectable({
  providedIn: 'root'
})
export class MusicRepertoireService {
  private http: HttpClient = inject(HttpClient);
  private apiURLService: ApiURLService = inject(ApiURLService);
  private baseURL: string = this.apiURLService.api().protected().build();

  public musicRepertoire: WritableSignal<any[]> = signal<any[]>([]);
  public userToQuery: WritableSignal<string[] | null> = signal<string[] | null>(null);


  /**
   * Fetches the user's music repertoire - default on the page initialization.
   */
  async getMusicRepertoire_Me(): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicRepertoire/me`, {},
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
