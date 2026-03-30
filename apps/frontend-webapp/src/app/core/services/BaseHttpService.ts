import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiURLService } from './api-url.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ScopedHttpClient } from '../utils/ScopedHttpClient';


@Injectable({ providedIn: 'root' })
export abstract class BaseHttpService {
  protected readonly http: HttpClient = inject(HttpClient);
  protected readonly scopedHttp = inject(ScopedHttpClient);
  protected readonly UrlBuilder: ApiURLService = inject(ApiURLService);
  protected readonly toast = inject(ToastService);
}
