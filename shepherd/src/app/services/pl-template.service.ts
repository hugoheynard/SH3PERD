import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlTemplateService {
  private http: HttpClient = inject(HttpClient);
  private baseURL: string = environment.baseURL;

  async getPlTemplates(): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.get(
          `${this.baseURL}/playlist/template/`,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));
      return response;

    } catch(e) {
      console.log('Playlist template retrieval went wrong', e);
      return false;
    }
  };

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
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.put(
          `${this.baseURL}/playlist/template`,
          { data: { ...input.formData } },
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      return response
    } catch(e) {
      console.log('Playlist template update went wrong', e);
      return false;
    }
  };

  async deletePlTemplate(input: { id: string }): Promise<any> {
    try {
      const response: HttpResponse<any> = await firstValueFrom(
        this.http.delete(
          `${this.baseURL}/playlist/template/${input.id}`,
          {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            observe: 'response'
          }));

      return response;
    } catch(e) {
      console.log('Playlist template deletion went wrong', e);
      return false;
    }
  };

}
