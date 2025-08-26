import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { savePlaylist } from './save-playlist';
import { HttpClient, HttpHeaders } from '@angular/common/http';

describe('savePlaylist', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  const mockBaseUrl = 'https://api.example.com';
  const mockPlaylistData = { name: 'My Playlist', songs: ['song1', 'song2'] };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Vérifie qu'aucune requête en attente
  });

  it('should successfully save a playlist', async () => {
    const mockResponse = { message: 'Playlist saved successfully' };

    const resultPromise = savePlaylist({
      http: httpClient,
      baseURL: mockBaseUrl,
      playlistData: mockPlaylistData
    });

    // Simule une réponse HTTP 200
    const req = httpTestingController.expectOne(`${mockBaseUrl}/playlist/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ playlistData: mockPlaylistData });

    // Répondre avec succès
    req.flush(mockResponse, { status: 200, statusText: 'OK' });

    // Vérification du résultat
    await expectAsync(resultPromise).toBeResolvedTo(mockResponse);
  });

  it('should throw an error if API returns 500', async () => {
    const errorMessage = '[savePlaylist]: API returned an error (status: 500)';

    const resultPromise = savePlaylist({
      http: httpClient,
      baseURL: mockBaseUrl,
      playlistData: mockPlaylistData
    });

    // Simule une réponse HTTP 500 (erreur serveur)
    const req = httpTestingController.expectOne(`${mockBaseUrl}/playlist/`);
    req.flush({ message: 'Internal Server Error' }, { status: 500, statusText: 'Internal Server Error' });

    // Vérifie que l'erreur est bien levée
    await expectAsync(resultPromise).toBeRejectedWithError(errorMessage);
  });

  it('should throw an error if baseURL is missing', async () => {
    const resultPromise = savePlaylist({
      http: httpClient,
      baseURL: '', // URL manquante
      playlistData: mockPlaylistData
    });

    await expectAsync(resultPromise).toBeRejectedWithError('[savePlaylist]: Invalid input parameters');
  });

  it('should throw an error if playlistData is missing', async () => {
    const resultPromise = savePlaylist({
      http: httpClient,
      baseURL: mockBaseUrl,
      playlistData: null // Données de playlist manquantes
    });

    await expectAsync(resultPromise).toBeRejectedWithError('[savePlaylist]: Invalid input parameters');
  });
});
