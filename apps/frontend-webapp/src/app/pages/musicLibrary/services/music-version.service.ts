import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiURLService } from '../../../services/api-url.service';


@Injectable({
  providedIn: 'root'
})
export class MusicVersionService {
  private http: HttpClient = inject(HttpClient);
  private apiURLService: ApiURLService = inject(ApiURLService);
  private baseURL: string = this.apiURLService.api().protected().build();

  /**
   * This service is responsible for posting a new music versions.
   */
  postMusicVersion(musicVersionPayload: any): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicVersion`,
          musicVersionPayload,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      if (!response.ok) {
        return false;
      }
      return result;

    } catch(e) {
      console.log('error while creating music version', e);
      return false;
    }
  };
}
