import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const updatePlaylist = async (input: { http: HttpClient, url: string, playlistData: any}): Promise<any> => {
  const { http, url, playlistData} = input;

  if (!http || !url || !playlistData) {
    throw new Error('[savePlaylist]: Invalid input parameters');
  }

  const response: HttpResponse<any> = await firstValueFrom(
    http.put(
      url,
      { playlistData},
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        observe: 'response'
      })
    );

    if (!response.ok) {
      throw new Error(`[savePlaylist]: API returned an error (status: ${response.status} response: ${response})`);
    }

    return response;
};
