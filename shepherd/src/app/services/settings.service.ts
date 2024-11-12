import {inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private baseURL: string = 'http://localhost:3000'
  private settingsID = '673362c5c2ca95290b7cfdd5'; //TODO on fera pas comme ça !


  async getWeekTemplate() {
    try {
      const response = await firstValueFrom(this.http.get(
        `${this.baseURL}/settings/company/weekTemplate/id/${this.settingsID}`,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }),
      );

      if (!response.ok) return false;
      return response.body;

    } catch(e) {
      console.log('week template update went wrong', e)
      return false;
    }
  };

  async updateWeekTemplate(formData: any) {
    try {
      const response = await firstValueFrom(this.http.put(
        `${this.baseURL}/settings/company/weekTemplate`,
        {
          settings_id: this.settingsID,
          data: formData
        },
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        })
      );

      if (!response.ok) return false;
      return response;

    } catch(e) {
      console.log('week template update went wrong', e)
      return false;
    }
  };

}
