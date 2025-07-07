import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';
import { HttpClient } from '@angular/common/http';
import { ApiURLService } from '../../../services/api-url.service';

@Injectable({
  providedIn: 'root'
})
export class MusicReferenceService {
  private http: HttpClient = inject(HttpClient);
  private apiURLService: ApiURLService = inject(ApiURLService);
  private baseURL: string = this.apiURLService.api().protected().build();

  searchByTitleAndArtist(title: string, artist: string): Observable<TMusicReferenceDomainModel[]> {

    return this.http.get<TMusicReferenceDomainModel[]>(
      `${this.baseURL}/music-reference/dynamic-search`,
      { params: { title, artist } }
    );
  }
}
