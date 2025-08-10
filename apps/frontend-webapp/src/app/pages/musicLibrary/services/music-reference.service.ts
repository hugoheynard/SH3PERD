import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { TMusicReferenceCreationResponseDTO, TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { TCreateMusicReferenceRequestDTO } from '@sh3pherd/shared-types';
import { BaseHttpService } from '../../../services/BaseHttpService';


@Injectable({
  providedIn: 'root'
})
export class MusicReferenceService extends BaseHttpService {
  private baseURL: string = this.apiURLService.getProtectedBaseUrl('music-reference');

  /**
   * Searches for music references by title and artist.
   * @param title
   * @param artist
   */
  searchByTitleAndArtist(title: string, artist: string): Observable<TMusicReferenceDomainModel[]> {

    return this.http.get<TMusicReferenceDomainModel[]>(
      `${this.baseURL}/dynamic-search`,
      { params: { title, artist }, withCredentials: true }
    );
  };

  /**
   * Creates a new music reference.
   * @param payload
   */
  async createOne(payload: TCreateMusicReferenceRequestDTO): Promise<TMusicReferenceDomainModel | false> {
    try {
      const response = await firstValueFrom(
        this.http.post<TMusicReferenceCreationResponseDTO>(
          this.baseURL,
          { payload },
          { withCredentials: true, observe: 'response' }
        )
      );

      const { ok, body } = response;

      if (!ok || !body || !body.data || !body.message) {
        this.snackBar.show('Failed to create music reference', 'Close', 3000, 'center', 'bottom');
        return false;
      }

      this.snackBar.show(body.message, 'Close', 3000, 'center', 'bottom');
      return body.data;
    } catch (error) {
      this.snackBar.show('Network or server error.', 'Close', 3000, 'center', 'bottom');
      console.error('createOne error:', error);
      return false;
    }
  };
}
