import type { SlotPreview } from './slot-drag-constraints-engine';
import type { ArtistPerformanceSlot } from '../../../program-types';

export interface SlotConstraintStrategy {
  key: SlotConstraintsKeys;

  apply(
    preview: SlotPreview[],
    ctx: {
      slotsById: Map<string, ArtistPerformanceSlot>;
      roomSlots: ArtistPerformanceSlot[];
    }
  ): SlotPreview[];
}

export enum SlotConstraintsKeys {
  NONE = 'none',
  STRICT = 'strict',
  RIPPLE = 'ripple',
}
