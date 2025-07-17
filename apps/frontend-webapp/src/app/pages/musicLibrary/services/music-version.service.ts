import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
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
  async createOneMusicVersion(payload: TMusicVersionCreationFormPayload): Promise<TMusicVersionDomainModel | false> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          this.baseURL,
          { payload },
          { observe: 'response' }
        ));

      if (!response.ok) {
        return false;
      }
      return response.body.data;

    } catch(e) {
      console.log('error while creating music version', e);
      return false;
    }
  };

/*
  async getMusicVersionBy_Me(): Promise<TMusicVersionDomainModel[]> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.get<TMusicVersionDomainModel[]>(
          `${this.baseURL}/me`,
          { observe: 'response' }
        ));

      if (!response.ok) {
        return [];
      }
      return response.body.data;

    } catch(e) {
      console.log('error while getting music versions', e);
      return [];
    }
  }
   */

}


