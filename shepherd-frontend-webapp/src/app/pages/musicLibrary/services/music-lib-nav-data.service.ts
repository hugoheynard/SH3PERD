import {Injectable, signal} from '@angular/core';
import {ITabDefinition} from '../../../components/tab-system/ITabDefinition';

@Injectable({
  providedIn: 'root'
})
export class MusicLibNavDataService {
  private tabConfigSignal = signal<any | null>(null);

  setTabConfig(tabConfig: ITabDefinition[]): void {
    this.tabConfigSignal.set(tabConfig);
  };

  getTabConfig(): any | null {
    return this.tabConfigSignal();
  };

  clearConfig(): void {
    this.tabConfigSignal.set(null);
  };
}
