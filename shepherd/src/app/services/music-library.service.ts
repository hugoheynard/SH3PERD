import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryService {
  private http: HttpClient = inject(HttpClient);
  private baseURL: string = 'http://localhost:3000';

  async getMusic(): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.get(
          `${this.baseURL}/musicLibrary/`,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }))

      if (!response.ok) return false;
      console.log(response.body.musicLibraryData)
      return response.body.musicLibraryData;
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
