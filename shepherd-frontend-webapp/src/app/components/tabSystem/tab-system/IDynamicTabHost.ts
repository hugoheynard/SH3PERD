import {ITabDefinition} from './ITabDefinition';

export interface IDynamicTabHost {
  generateDefaultTab: (id: string) => ITabDefinition;
}
