import { Injectable } from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  async goToHome(): Promise<boolean> {
    return await this.router.navigateByUrl('/app/home');
  };

  goToLogin(): Promise<boolean> {
    return this.router.navigate(['/login']);
  }
}
