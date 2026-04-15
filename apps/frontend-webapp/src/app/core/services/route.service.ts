import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private router: Router = inject(Router);

  static tryCatchDecorator(_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
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
  async navigateToMusicLibrary(){
    await this.router.navigate(['app/musicLibrary']);
  };

  @RouteService.tryCatchDecorator
  async navigateToPlaylist(){
    await this.router.navigate(['app/playlistManager']);
  };

  @RouteService.tryCatchDecorator
  async navigateToLogin(){
    await this.router.navigate(['login']);
  };


}
