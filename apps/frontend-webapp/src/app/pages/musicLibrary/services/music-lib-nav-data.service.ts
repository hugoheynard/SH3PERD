import {Injectable, signal} from '@angular/core';
import type { ITabDefinition } from '../../../components/tabSystem/tab-system/ITabDefinition';

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

  /*
  saveTabConfig(tabConfig: ITabDefinition[]): void {

  }

  openMusicTab(mode: 'add'| 'edit', tab?: ITabDefinition): void {

  };

   */





  //-----------DB Interaction Methods-----------
  async loadMusicTabConfigFromDB(): Promise<void> {
    // Placeholder for actual DB interaction logic
    //return [];
  };

  async saveMusicTabConfigFromDB(): Promise<void> {
    // Placeholder for actual DB interaction logic
    //return [];
  }


  //-----------TabConfig Utils-----------
  getTabConfigMap(tabConfig: ITabDefinition[]): Map<string, ITabDefinition> {
    return new Map<string, ITabDefinition>(
      tabConfig.map(tab => [tab.id, tab])
    );
  };
}
