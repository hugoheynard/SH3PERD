import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiURLService } from './api-url.service';
import { SnackbarService } from './snackbar.service';
import { ScopedHttpClient } from '../utils/ScopedHttpClient';


@Injectable({ providedIn: 'root' })
export abstract class BaseHttpService {
  protected readonly http: HttpClient = inject(HttpClient);
  protected readonly scopedHttp = inject(ScopedHttpClient);
  protected readonly UrlBuilder: ApiURLService = inject(ApiURLService);
  protected readonly snackBar = inject(SnackbarService);
}
