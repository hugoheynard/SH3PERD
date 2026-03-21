import {
  Component,
  inject,
  type OnInit, HostListener, type AfterViewInit, computed, ViewChild, type ElementRef,
} from '@angular/core';

import { SlotPlannerComponent } from '../timeline/elements/slot-planner/slot-planner.component';
import { ProgramHeaderComponent } from '../program-header/program-header.component';

import {
  TimelineInteractionService
} from '../services/timeline-interactions-engine/timeline-interaction.service';

import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../panels/program-side-panel/program-side-panel.component';
import { TimeMarkersComponent } from '../time-markers/time-markers.component';

import {
  mockPerformanceSlotsTemplates,
} from '../utils/mockDATAS';
import type {
  ArtistPerformanceSlot, TimelineCue,
} from '../program-types';
import { EditPerformanceSlotPopoverComponent } from '../popovers/edit-performance-slot-popover/edit-performance-slot-popover.component';
import { SlotService } from '../services/mutations-layer/slot.service';
import { PlannerSelectorService } from '../services/selector-layer/planner-selector.service';
import { BufferSlotComponent } from '../timeline/elements/bufferblock/buffer-slot.component';
import { PlannerDndInitService } from '../services/planner-init/planner-dnd-init.service';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { RoomColumnComponent } from '../room-column/room-column.component';
import { SlotSelectionService } from '../services/timeline-interactions-engine/slot-selection.service';
import { RoomLayoutRegistry } from '../services/room-layout-registry.service';
import { TimelineInteractionStore } from '../services/timeline-interactions-engine/timeline-interaction.store';
import { TimelineSpatialService } from '../services/timeline-spatial.service';
import { InsertLineService } from '../timeline/insert-interaction-system/state-services/insert-line.service';
import { TimelineCueComponent } from '../timeline/elements/timeline-cue/timeline-cue.component';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { PlannerInsertActionsInitService } from '../services/planner-init/planner-insert-action-init.service';
import { CueSelectionService } from '../services/timeline-interactions-engine/cue-selection.service';
import { TimelineKeyboardController } from '../services/timeline-keyboard-controller.service';


@Component({
  selector: 'ui-programs-page',
  imports: [
    SlotPlannerComponent,
    ProgramHeaderComponent,
    TimeMarkersComponent,
    BufferSlotComponent,
    DndDropZoneDirective,
    DndDragDirective,
    RoomColumnComponent,
    TimelineCueComponent,
  ],
  templateUrl: './programs-page.component.html',
  styleUrl: './programs-page.component.scss',
  host: {
    class: 'no-select',
  }
})
export class ProgramsPageComponent implements OnInit, AfterViewInit {

  public selector = inject(PlannerSelectorService);
  private drag = inject(DragSessionService);
  public slotServ = inject(SlotService);
  private interaction = inject(TimelineInteractionService);
  private interactionStore = inject(TimelineInteractionStore);
  private layout = inject(LayoutService);
  private spatial = inject(TimelineSpatialService);
  private insert = inject(InsertLineService);
  private res = inject(PlannerResolutionService);

  constructor() {
    void inject(PlannerDndInitService);
    void inject(PlannerInsertActionsInitService);
  }

  // --------------- LIFECYCLE -------------//

  ngOnInit() {
    // set left side panel
    this.layout.setLeftPanel(ProgramSidePanelComponent, {
      templates: mockPerformanceSlotsTemplates,
      staff: this.selector.staff,
      groups: this.selector.userGroups,
    });
  };

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.roomLayout.refresh();
    });
    this.plannerEl.nativeElement.addEventListener('scroll', () => {
      this.roomLayout.refresh();
    });
  }

  @ViewChild('planner', { static: true }) plannerEl!: ElementRef;


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

  draggingIds = computed(() =>
    this.interactionStore.draggingSlots()?.map(s => s.slot_id) ?? []
  );


  /* ---------------- SLOT DRAG / RESIZE ---------------- */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot): void {

    if (event.altKey) {

      const copy: ArtistPerformanceSlot = {
        ...slot,
        id: crypto.randomUUID(),
        artists: [...slot.artists]
      };

      this.slotServ.add(copy);

      this.interaction.startSlotDrag(event, copy);

      return;
    }

    this.interaction.startSlotDrag(event, slot);
  };

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot): void {
    this.interaction.startSlotResize(event, slot);
  };

  //* ---------------- DROP HANDLERS ---------------- *//

  handleRoomDrop(roomId: string, drag: DragState) {

    if (drag.type === 'template') {

      const projection = this.spatial.projectPointer(0);

      if (!projection) {
        return;
      }

      this.slotServ.add({
        id: crypto.randomUUID(),
        name: drag.data.name,
        startMinutes: projection.minutes,
        duration: drag.data.duration,
        type: drag.data.type,
        color: drag.data.color,
        roomId,
        artists: [],
        playlist: drag.data.playlist,
        song: drag.data.song
      });

      this.insert.clear();
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

  handleRemoveArtistFromSlot(e: { slot_id: string; artist_id: string }):void {
    this.slotServ.removeArtistFromSlot(e.slot_id, e.artist_id);
  };


  //* -------------POPOVERS ---------------------------*//
  /**
   * Opens the slot edition popover
   * @param slot_id
   */
  openEditPerformanceSlotPopover(slot_id: string) {
    this.layout.setPopover(EditPerformanceSlotPopoverComponent, { id: slot_id });
  };


//* ------------- SLOT SELECTION AND CONTROLS ---------------------------*//
  private selection = inject(SlotSelectionService);

  handleSlotPointerDown(e: {event: PointerEvent, slot: ArtistPerformanceSlot}) {

    const { event, slot } = e;

    const orderedIds = this.selector
      .blocksByRoom()
      .get(slot.roomId)
      ?.filter(b => b.type === 'slot')
      .map(b => b.slot.id) ?? [];

    const isModifier = event.shiftKey || event.metaKey || event.ctrlKey;
    const alreadySelected = this.selection.isSelected(slot.id);

    if (isModifier || !alreadySelected) {
      this.selection.select(
        slot.id,
        orderedIds,
        event
      );
    }

    this.startSlotDrag(event, slot);
  };


  /* ---------------- HOST LISTENERS ---------------- */
  private keyboard = inject(TimelineKeyboardController);

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    this.drag.updatePointer(event);

    // 1 - drag, resize
    this.interaction.handlePointerMove();

    // 2️⃣ ALT mode → insert line libre
    if (this.insert.altMode()) {

      this.roomLayout.refresh(); // 🔥 IMPORTANT

      const projection = this.spatial.projectPointer(0);

      if (!projection) {
        this.insert.clear();
        return;
      }

      this.insert.set(
        projection.minutes,
        projection.room_id,
        false
      );
    }
  };

  @HostListener('document:pointerup')
  onPointerUp() {
    this.interaction.stop();
  };

  /**
   * When clicking on a non slot element, removes selection of slots
   * @param event
   */
  @HostListener('document:pointerdown', ['$event'])
  clearSelection(event: PointerEvent) {

    const el = event.target as HTMLElement;

    if (!el.closest('[data-slot-id]')) {
      this.selection.clear();
    }
  };


  private roomLayout = inject(RoomLayoutRegistry)
  @HostListener('window:resize')
  onResize() {
    this.roomLayout.refresh();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    this.keyboard.handleKeyDown(event);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    this.keyboard.handleKeyUp(event);
  }

  @HostListener('window:blur')
  handleBlur() {
    this.keyboard.handleBlur();
  }


  // ---------- CUES ---------//
  getCueTop(cue: TimelineCue) {
    return this.res.minuteToPx(cue.atMinutes) - this.selector.gridOffsetPx();
  }


  private cueSelection = inject(CueSelectionService);

  selectCue(cue: TimelineCue, event: PointerEvent) {
    const orderedIds =
      this.selector.cuesByRoom().get(cue.roomId)?.map(c => c.id) ?? [];

    this.cueSelection.select(cue.id, orderedIds, event);
  };




}
