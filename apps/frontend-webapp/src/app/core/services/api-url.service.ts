import { Injectable } from '@angular/core';
import {environment} from '../../../environments/env.dev';

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

  /**
   * API segment adds /api to the URL
   */
  api(): this {
    this.segments.push('api');
    return this;
  };

  /**
   * Protected segment adds /protected to the URL
   */
  protected(): this {
    this.segments.push('protected');
    return this;
  };

  /**
   * Route segment adds a custom path to the URL
   * @param path
   */
  route(path: string): this {
    this.segments.push(path.replace(/^\//, ''));
    return this;
  };

  /**
   * For routes that are scoped to a specific contract
   * backend will resolve the scope from the user's context
   * */
  scoped(scope: string): this {
    this.segments.push(`scoped/${scope}`);
    return this;
  };

  /**
   * Shortcut for current contract scope
   */
  currentContractScoped(): this {
    this.scoped('contract/current');
    return this;
  };

  /**
   * Builds the final URL string and resets the segments for reuse.
   */
  build(): string {
    const full = [this.baseUrl, ...this.segments].join('/');
    this.reset(); // important to allow reuse
    return full;
  };

  apiProtectedRoute(prefix: string): this {
    this.api();
    this.protected();
    this.route(prefix);
    return this;
  };
}
