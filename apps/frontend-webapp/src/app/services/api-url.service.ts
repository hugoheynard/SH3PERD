import { Injectable } from '@angular/core';
import {environment} from '../../environments/env.dev';

@Injectable({
  providedIn: 'root'
})
export class ApiURLService {
  private baseUrl: string = environment.apiBaseUrl;
  private segments: string[] = [];

  constructor() { }
  reset(): void {
    this.segments = [];
  };

  api(): this {
    this.segments.push('api');
    return this;
  };

  protected(): this {
    this.segments.push('protected');
    return this;
  };

  route(path: string): this {
    this.segments.push(path.replace(/^\//, ''));
    return this;
  };

  build(): string {
    const full = [this.baseUrl, ...this.segments].join('/');
    this.reset(); // important to allow reuse
    return full;
  };
}
