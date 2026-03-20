import { computed, inject, Injectable } from '@angular/core';
import type { ArtistPerformanceSlot } from '../../program-types';
import { ProgramStateService } from '../program-state.service';
import { TimelineInteractionStore } from '../timeline-interactions/timeline-interaction.store';
import { minutesToTime, time_functions_utils } from '../../utils/time_functions_utils';

@Injectable({
  providedIn: 'root'
})
export class SlotSelectorService {
  private state = inject(ProgramStateService);
  private interactionStore = inject(TimelineInteractionStore);


  slots = computed(() => this.state.program().slots);


  /**
   * The method iterates through the slots to provide a Map <slot_id, slot>
   * @returns a Map where each key is a slot ID and the corresponding value is the ArtistPerformanceSlot object associated with that ID, allowing for efficient retrieval of performance slot information based on their unique identifiers.
   */
  slotsById = computed(() => {
    const map = new Map<string, ArtistPerformanceSlot>();

    for (const slot of this.slots()) {
      map.set(slot.id, slot);
    }

    return map;
  });

  /**
   * Used to display the dragging slots
   */
  displaySlots = computed(() => {

    const baseSlots = this.slots();
    const dragging = this.interactionStore.draggingSlots();

    if (!dragging) return baseSlots;

    const previewMap = new Map(
      dragging.map(s => [s.slotId, s])
    );

    return baseSlots.map(slot => {

      const preview = previewMap.get(slot.id);

      if (!preview) return slot;

      return {
        ...slot,
        startMinutes: preview.previewStart,
        roomId: preview.previewRoomId ?? slot.roomId,
        isPreview: true
      };
    });
  });

  slotsByRoom = computed(() => {

    const map = new Map<string, ArtistPerformanceSlot[]>();

    for (const slot of this.slots()) {

      const arr = map.get(slot.roomId) ?? [];

      arr.push(slot);

      map.set(slot.roomId, arr);
    }

    return map;
  });

  getSlotStartTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.state.program().startTime);
    const absolute = programStartMinutes + slot.startMinutes;
    return minutesToTime(absolute);
  };


  getSlotEndTime(slot: ArtistPerformanceSlot): string {
    const programStartMinutes = time_functions_utils(this.state.program().startTime);
    const absolute =
      programStartMinutes + slot.startMinutes + slot.duration;
    return minutesToTime(absolute);
  };
}
