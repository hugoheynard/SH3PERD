import { Injectable, Type } from '@angular/core';
import type { DragPayloadMap, DragType } from './drag.types';


//TODO : améliorer le typage?
//TODO : voir pour extends baseRegistry si ça fonctionne

export interface DragPreviewDefinition<T> {
  component: Type<unknown>;
  mapInputs: (data: T) => Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class DragPreviewRegistryService {

  private registry = new Map<DragType, DragPreviewDefinition<any>>();

  /**
   * Register a preview component for a drag type
   */
  register<K extends DragType>(
    type: K,
    definition: DragPreviewDefinition<DragPayloadMap[K]>
  ) {
    if (this.registry.has(type)) {
      console.warn(`Drag preview already registered for type "${type}"`);
    }

    this.registry.set(type, definition);
  };

  /**
   * Get preview definition for a drag type
   */
  get<K extends DragType>(type: K) {
    return this.registry.get(type) as
      | DragPreviewDefinition<DragPayloadMap[K]>
      | undefined;
  };

}
