import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

export const deletePlaylist = async (input: { http: HttpClient; url: string; }): Promise<any> => {
  try {
    const { http, url } = input;

    if (!http || !url ) {
      throw new Error('[savePlaylist]: Invalid input parameters');
    }

    const response: HttpResponse<any> = await firstValueFrom(
      http.delete(
        url,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          observe: 'response'
        }
      )
    );

    if (!response.ok) {
      throw new Error(`[deletePlaylist]: API returned an error (status: ${response.status})`);
    }

    return response;
  } catch (error: any) {
    console.error('[deletePlaylist]: Error deleting playlist', error);
    // Plutôt que de relancer `error` tel quel, renvoie un nouvel objet Error pour mieux tracer le problème
    throw new Error(`[deletePlaylist]: ${error.message || 'Unknown error occurred'}`);
  }
};
