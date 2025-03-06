import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlTemplateService {
  private http: HttpClient = inject(HttpClient);
  private baseURL: string = 'http://localhost:3000';
  async postPlTemplate(input: { formData: any }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.post(
          `${this.baseURL}/playlist/template`,
          { data: { ...input.formData } },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      return response;

    } catch(e) {
      console.log('Playlist template addition went wrong', e);
      return false;
    }
  };

  async updatePlTemplate(input: { formData: any }): Promise<any> {
    try {
    } catch(e) {
      console.log('Playlist template update went wrong', e);
      return false;
    }
  };

}
