import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export const getPlaylists = async (input: { http: HttpClient, url: string }): Promise<any> => {
  try{
    const { http, url } = input;

    const response: HttpResponse<any> = await firstValueFrom(
      http.get(
        url,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }));

    if (!response.ok) {
      console.error('Error creating new empty playlist');
    }
    return response.body.playlist;
  } catch(err) {
    console.error(err);
  }
};
