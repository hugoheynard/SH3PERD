import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryService {
  private http = inject(HttpClient);
  private baseURL: string = 'http://localhost:3000';

  async addSong(input: { formData: Record<'title' | 'artist', string> }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/musicLibrary/addSong`,
          { data: input.formData },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          })
      );

      if (!response.ok) return false;
    } catch(e) {
      console.log('Song addition went wrong', e);
      return false;
    }
  };
}
