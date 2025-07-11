import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiURLService } from './api-url.service';

export abstract class BaseHttpService {
  protected readonly http: HttpClient = inject(HttpClient);
  protected readonly apiURLService: ApiURLService = inject(ApiURLService);

}
