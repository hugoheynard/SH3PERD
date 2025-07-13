import { inject, Injectable } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TMusicVersionCreationFormPayload } from '@shepherd/shared-types/music.versions';
import { BaseHttpService } from '../../../services/BaseHttpService';
import { TMusicVersionDomainModel } from '@sh3pherd/shared-types';


@Injectable({
  providedIn: 'root'
})
export class MusicVersionService extends BaseHttpService{
  private baseURL: string = this.apiURLService.getProtectedBaseUrl('music-version');

  /**
   * This service is responsible for posting a new music versions.
   */
  async createOneMusicVersion(musicVersionFormDataPayload: TMusicVersionCreationFormPayload): Promise<TMusicVersionDomainModel | false> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/music-version`,
          musicVersionFormDataPayload,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      if (!response.ok) {
        return false;
      }
      return response.body.data;

    } catch(e) {
      console.log('error while creating music version', e);
      return false;
    }
  };
}
