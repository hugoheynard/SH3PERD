import { Injectable } from '@angular/core';
import { SlotConstraintsKeys, type SlotConstraintStrategy } from './slot-drag-constraints-strategy.types';
import type { SlotPreview } from './slot-drag-constraints-engine';


@Injectable({ providedIn: 'root' })
export class NoConstraintStrategy implements SlotConstraintStrategy {
  key = SlotConstraintsKeys.NONE;

  apply(preview: SlotPreview[]): SlotPreview[] {
    return preview;
  }
}
