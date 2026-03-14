import { Injectable, Type } from '@angular/core';
import type { DragPayloadMap } from './drag.types';

export interface DragPreviewDefinition<T> {
  component: Type<any>;
  mapInputs: (data: T) => Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class DragPreviewRegistryService {

  private registry = new Map<
    keyof DragPayloadMap,
    DragPreviewDefinition<any>
  >();

  /**
   * Register a preview component for a drag type
   */
  register<K extends keyof DragPayloadMap>(
    type: K,
    definition: DragPreviewDefinition<DragPayloadMap[K]>
  ) {
    this.registry.set(type, definition);
  };

  /**
   * Get preview definition for a drag type
   */
  get<K extends keyof DragPayloadMap>(type: K) {
    return this.registry.get(type) as
      | DragPreviewDefinition<DragPayloadMap[K]>
      | undefined;
  };

}
