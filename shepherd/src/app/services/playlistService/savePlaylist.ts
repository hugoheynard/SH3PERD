import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export async function savePlaylist(input: { http: HttpClient, url: string, playlistData: any }): Promise<any> {
  try {
    const { http, playlistData, url } = input;

    if (!http || !baseURL || !playlistData) {
      throw new Error('[savePlaylist]: Invalid input parameters');
    }

    const response: HttpResponse<any> = await firstValueFrom(
      http.post(
        url,
        { playlistData },
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }
      )
    );

    if (!response.ok) {
      throw new Error(`[savePlaylist]: API returned an error (status: ${response.status})`);
    }

    return response;
  } catch (error: any) {
    console.error('[savePlaylist]: Error saving playlist', error);
    // Plutôt que de relancer `error` tel quel, renvoie un nouvel objet Error pour mieux tracer le problème
    throw new Error(`[savePlaylist]: ${error.message || 'Unknown error occurred'}`);
  }
}
