import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);

  async updateWeekTemplate(formData: any) {
    try {
      const response = await firstValueFrom(this.http.post(
        'company/settings/weekTemplate',
        { data: formData },
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
