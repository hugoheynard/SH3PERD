import {AuthService} from './app/core/services/auth.service';
import {firstValueFrom} from 'rxjs';

export function authInitializerFactory(authService: AuthService): () => Promise<any> {
  return () => firstValueFrom(authService.autoLogin());
}
