import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private router = inject(Router);

  static tryCatchDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        console.error(`Navigation error ${propertyKey}:`, error);
        throw error;
      }
    };

    return descriptor;
  }

  @RouteService.tryCatchDecorator
  async navigateToHome(){
      await this.router.navigate(['app/home']);
  };

  @RouteService.tryCatchDecorator
  async navigateToCalendar(){
      await this.router.navigate(['app/calendar']);
  };

  @RouteService.tryCatchDecorator
  async navigateToMusicLibrary(){
    await this.router.navigate(['app/musicLibrary']);
  };

  @RouteService.tryCatchDecorator
  async navigateToSettings(){
    await this.router.navigate(['app/settings']);
  };

  @RouteService.tryCatchDecorator
  async navigateToLogin(){
    await this.router.navigate(['login']);
  };


}
