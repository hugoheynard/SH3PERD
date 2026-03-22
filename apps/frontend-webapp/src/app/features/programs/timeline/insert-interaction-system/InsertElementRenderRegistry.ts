import { Injectable, Type } from '@angular/core';
import type { InsertActionType } from './actions-services/insert-action.types';
import { BaseRegistry } from '../../../../core/utils/base-registry';


@Injectable({ providedIn: 'root' })
export class InsertRenderRegistry
  extends BaseRegistry<InsertActionType, InsertRenderDefinition>
{
  constructor() {
    super('InsertRenderRegistry');
  }
}

export type InsertRenderDefinition = {
  component: Type<any>;
  createGhost: (ctx: {
    minutes: number;
    roomId: string;
  }) => unknown;
  mapInputs: (ghost: any) => Record<string, unknown>;
};

//TODO voir pour meilleure gestion des ghost sur les elements insert
