import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

/**
 * API service for music repertoire entries.
 *
 * TODO: Backend endpoint POST /api/protected/music-repertoire/entry
 * does not exist yet. `addEntry()` is currently stubbed with a
 * simulated success response. Replace with real HTTP call once
 * the backend route is implemented.
 */
@Injectable({
  providedIn: 'root',
})
export class MusicRepertoireApiService {
  // Ready for when backend endpoint is available:
  // private readonly apiServ = inject(ApiURLService);
  // private readonly http = inject(HttpClient);
  // private readonly URL = this.apiServ.apiProtectedRoute('music-repertoire').build();

  /**
   * Adds a music reference to the current user's repertoire.
   * @stub Returns a simulated success after 300ms.
   */
  addEntry(_referenceId: string): Observable<{ entryId: string }> {
    // TODO: replace with real POST once backend endpoint exists
    // return this.http.post<{ entryId: string }>(
    //   `${this.URL}/entry`,
    //   { referenceId: _referenceId },
    //   { withCredentials: true }
    // );
    return of({ entryId: crypto.randomUUID() }).pipe(delay(300));
  }
}
