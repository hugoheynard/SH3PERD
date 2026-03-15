import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
  type OnInit, HostListener,
} from '@angular/core';

import { PerformanceSlotComponent } from '../performance-slot/performance-slot.component';
import { ProgramHeaderComponent } from '../program-header/program-header.component';

import {
  TimelineInteractionService
} from '../services/timeline-interaction.service';

import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../program-side-panel/program-side-panel.component';
import { TimeMarkersComponent } from '../time-markers/time-markers.component';

import {
  mockPerformanceSlotsTemplates,
} from '../utils/mockDATAS';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import type {
  ArtistPerformanceSlot,
} from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { EditPerformanceSlotPopoverComponent } from '../edit-performance-slot-popover/edit-performance-slot-popover.component';
import { RoomService } from '../services/planner-state-mutations/room.service';
import { SlotService } from '../services/planner-state-mutations/slot.service';
import { PlannerSelectorService } from '../services/planner-selector.service';
import { BufferSlotComponent } from '../bufferblock/buffer-slot.component';
import { PlannerDndInitService } from '../services/planner-dn-dinit.service';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { RoomColumnComponent } from '../room-column/room-column.component';


@Component({
  selector: 'ui-programs-page',
  imports: [
    PerformanceSlotComponent,
    ProgramHeaderComponent,
    TimeMarkersComponent,
    BufferSlotComponent,
    DndDropZoneDirective,
    DndDragDirective,
    RoomColumnComponent,
  ],
  templateUrl: './programs-page.component.html',
  styleUrl: './programs-page.component.scss'
})
export class ProgramsPageComponent implements OnInit {

  selector = inject(PlannerSelectorService);

  public roomServ = inject(RoomService);
  public slotServ = inject(SlotService);

  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService)
  private interaction = inject(TimelineInteractionService);
  private layout = inject(LayoutService);

  constructor() {
    void inject(PlannerDndInitService);
  }

  /* ---------------- STATE SIGNALS FOLLOW---------------- */

  rooms = this.selector.rooms;
  slots = this.selector.slots;

  /**
   *  Returns an array of timeline blocks that are associated with a specific room, identified by the provided roomId. It uses the blocksByRoom selector from the PlannerSelectorService to retrieve the blocks for the given roomId. If there are no blocks found for the specified roomId, it returns an empty array.
   * @param roomId
   */
  getBlocksForRoom(roomId: string) {
    return this.selector.blocksByRoom().get(roomId) ?? [];
  };

  /* ---------------- DRAG STATE ---------------- */
  previewTop = 0;
  previewRoomId?: string;

  @ViewChildren('roomLayer') roomLayers!: QueryList<ElementRef<HTMLDivElement>>;

  /* ---------------- LIFECYCLE ---------------- */

  ngOnInit() {
    // set left side panel
    this.layout.setLeftPanel(ProgramSidePanelComponent, {
      templates: mockPerformanceSlotsTemplates,
      staff: this.selector.staff,
      groups: this.selector.userGroups,
    });
  };

  /* ---------------- TIME UTILS ---------------- */

  getSlotHeight(minutes: number): number {
    return this.res.minuteToPx(minutes);
  };

  @HostListener('document:pointermove', ['$event'])
  onPointerMove() {

    const drag = this.drag.current();

    if (!drag) return;

    this.interaction.handlePointerMove();
  }

  @HostListener('document:pointerup')
  onPointerUp() {
    this.interaction.stop();
  }


  /* ---------------- SLOT DRAG / RESIZE ---------------- */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot): void {

    if (event.altKey) {

      const copy: ArtistPerformanceSlot = {
        ...slot,
        id: crypto.randomUUID(),
        artists: [...slot.artists]
      };

      this.slotServ.addSlot(copy);

      this.interaction.startSlotDrag(event, copy);

      return;
    }

    this.interaction.startSlotDrag(event, slot);
  }

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot): void {
    this.interaction.startSlotResize(event, slot);
  };




  //* ---------------- DROP HANDLERS ---------------- *//

  handleRoomDrop(roomId: string, drag: DragState, offsetY: number) {

    if (drag.type === 'template') {

      const previewTop = this.res.computePreviewTop(offsetY);

      const startMinutes = this.res.pxToMinutes(previewTop);

      this.slotServ.addSlot({
        id: crypto.randomUUID(),
        name: drag.data.name,
        startMinutes,
        duration: drag.data.duration,
        type: drag.data.type,
        color: drag.data.color,
        roomId,
        artists: [],
        playlist: drag.data.playlist,
        song: drag.data.song
      });

    }

    if (drag.type === 'slot') {

      if (drag.data.roomId !== roomId) {
        this.slotServ.updateSlotRoom(drag.data.id, roomId);
      }

    }
  }

  /**
   * Handles dropping an artist onto a performance slot.
   * If the current drag session is of type 'artist' and there is a hovered slot, adds the artist to that slot.
   * If the drag session is of type 'group', adds the entire group to the hovered slot.
   */
  handleSlotDrop(slotId: string, drag: DragState) {

    switch (drag.type) {

      case 'artist':
        this.slotServ.addArtistToSlot(slotId, drag.data);
        break;

      case 'group':
        this.slotServ.addGroupToSlot(slotId, drag.data);
        break;

    }
  };

  //* -------------POPOVERS ---------------------------*//

  /**
   * Opens the slot edition popover
   * @param slot_id
   */
  openEditPerformanceSlotPopover(slot_id: string) {
    this.layout.setPopover(EditPerformanceSlotPopoverComponent, { id: slot_id });
  };
}
