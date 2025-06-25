import {AuthService} from './app/services/auth.service';
import {firstValueFrom} from 'rxjs';

export function authInitializerFactory(authService: AuthService): () => Promise<boolean> {
  return () => firstValueFrom(authService.autoLogin());
};
