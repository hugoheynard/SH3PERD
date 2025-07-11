import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { TMusicReferenceCreationResponseDTO, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { TCreateMusicReferenceRequestDTO } from '@shepherd/shared-types/music-references';
import { BaseHttpService } from '../../../services/BaseHttpService';


@Injectable({
  providedIn: 'root'
})
export class MusicReferenceService extends BaseHttpService {
  private baseURL: string = this.apiURLService.getProtectedBaseUrl('music-reference');

  searchByTitleAndArtist(title: string, artist: string): Observable<TMusicReferenceDomainModel[]> {

    return this.http.get<TMusicReferenceDomainModel[]>(
      `${this.baseURL}/dynamic-search`,
      { params: { title, artist } }
    );
  };

  async createOne(payload: TCreateMusicReferenceRequestDTO): Promise<TMusicReferenceCreationResponseDTO> {
    const response = await firstValueFrom(
      this.http.post<TMusicReferenceCreationResponseDTO>(
        this.baseURL,
        { payload },
        { withCredentials: true, observe: 'response' }
      )
    );

    if (!response.ok) {
      throw new Error(`Failed to create music reference: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received from createOne');
    }

    console.log('MusicReferenceService.createOne response:', response.body);
    return response.body;
  };
}
