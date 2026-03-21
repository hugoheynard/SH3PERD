import { Injectable } from '@angular/core';
import type { ArtistPerformanceSlot } from '../../../program-types';
import { SlotConstraintsKeys, type SlotConstraintStrategy } from './slot-drag-constraints-strategy.types';
import { NoConstraintStrategy } from './NoConstraintsStrategy';
import { StrictConstraintStrategy } from './StrictConstraintStrategy';
import { RippleConstraintStrategy } from './RippleConstraintStrategy';


export type SlotPreview = {
  slot_id: string;
  previewStart: number;
  previewRoomId: string | null;
};

@Injectable({ providedIn: 'root' })
export class SlotConstraintEngine {

  private strategies = new Map<
    SlotConstraintsKeys,
    SlotConstraintStrategy
  >();

  private current!: SlotConstraintStrategy;

  constructor(
    no: NoConstraintStrategy,
    strict: StrictConstraintStrategy,
    ripple: RippleConstraintStrategy
  ) {
    // 🔥 auto register
    this.register(no);
    this.register(strict);
    this.register(ripple);

    // default
    this.setStrategy(SlotConstraintsKeys.NONE);
  }

  private register(strategy: SlotConstraintStrategy) {
    this.strategies.set(strategy.key, strategy);
  }

  setStrategy(key: SlotConstraintsKeys) {
    const strategy = this.strategies.get(key);

    if (!strategy) {
      throw new Error(`Strategy not found: ${key}`);
    }

    this.current = strategy;
  }

  apply(
    preview: SlotPreview[],
    ctx: {
      slotsById: Map<string, ArtistPerformanceSlot>;
      roomSlots: ArtistPerformanceSlot[];
    }
  ) {
    return this.current.apply(preview, ctx);
  }
}
