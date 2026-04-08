import {
  type AfterViewInit,
  Component,
  computed,
  type ElementRef,
  HostListener,
  inject,
  type OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { SlotPlannerComponent } from '../timeline/elements/slot-planner/slot-planner.component';
import { ProgramHeaderComponent } from '../program-header/program-header.component';

import { TimelineInteractionService } from '../services/timeline-interactions-engine/timeline-interaction.service';

import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../panels/program-side-panel/program-side-panel.component';
import { TimeMarkersComponent } from '../timeline/ui/time-markers/time-markers.component';

import { mockPerformanceSlotsTemplates } from '../utils/mockDATAS';
import type { ArtistPerformanceSlot, TimelineBuffer, TimelineCue } from '../program-types';
import {
  EditPerformanceSlotPopoverComponent,
} from '../popovers/edit-performance-slot-popover/edit-performance-slot-popover.component';
import { SlotService } from '../services/mutations-layer/slot.service';
import { PlannerSelectorService } from '../services/selector-layer/planner-selector.service';
import { PlannerDndInitService } from '../services/planner-init/planner-dnd-init.service';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import { type DragState, ResizeTargetType } from '../../../core/drag-and-drop/drag.types';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { RoomColumnComponent } from '../timeline/ui/room-column/room-column.component';
import {
  SlotSelectionService,
} from '../services/timeline-interactions-engine/element-selection/slot-selection.service';
import { RoomLayoutRegistry } from '../services/room-layout-registry.service';
import { TimelineInteractionStore } from '../services/timeline-interactions-engine/timeline-interaction.store';
import { TimelineSpatialService } from '../services/timeline-spatial.service';
import { InsertLineService } from '../timeline/insert-interaction-system/state-services/insert-line.service';
import { TimelineCueComponent } from '../timeline/elements/timeline-cue/timeline-cue.component';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { PlannerInsertActionsInitService } from '../services/planner-init/planner-insert-action-init.service';
import { CueSelectionService } from '../services/timeline-interactions-engine/element-selection/cue-selection.service';
import { TimelineKeyboardController } from '../services/timeline-keyboard-controller.service';
import { PlannerInsertRenderInitService } from '../services/planner-init/planner-insert-render-init.service';
import { SelectableDirective } from '../services/timeline-interactions-engine/element-selection/Selectable.directive';
import { BufferSlotComponent } from '../timeline/elements/bufferblock/buffer-slot.component';
import { ResizeInteractionService } from '../services/timeline-interactions-engine/resize-interaction.service';
import { SlotDragInteractionService } from '../services/timeline-interactions-engine/slot-drag-interaction.service';
import { CueDragInteractionService } from '../services/timeline-interactions-engine/cue-drag-interaction.service';
import { TimelineProjectionService } from '../services/timelineProjectionSystem/TimelineProjectionService';
import { BufferTransform } from '../services/timelineProjectionSystem/BufferTransform';


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
    SelectableDirective,
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

  constructor() {
    void inject(PlannerDndInitService);
    void inject(PlannerInsertActionsInitService);
    void inject(PlannerInsertRenderInitService);

    // Register projection hooks
    const projection = inject(TimelineProjectionService);
    projection.registerHook(inject(BufferTransform));
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

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngAfterViewInit() {
    if (!this.isBrowser) return;
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

  draggingCueIds = computed(() =>
    this.interactionStore.draggingCues()?.map(c => c.cue_id) ?? []
  );

  cuePreviewMap = computed(() => {
    const map = new Map<string, number>();
    for (const c of this.interactionStore.draggingCues() ?? []) {
      map.set(c.cue_id, c.previewAtMinutes);
    }
    return map;
  });


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
    this.interaction.startResize(event, {
      id: slot.id,
      roomId: slot.room_id,
      startMinutes: slot.startMinutes,
      duration: slot.duration,
      type: ResizeTargetType.SLOT
    });
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
        room_id: roomId,
        artists: [],
        playlist: drag.data.playlist,
        song: drag.data.song
      });

      this.insert.clear();
    }

    if (drag.type === 'slot') {

      if (drag.data.room_id !== roomId) {
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
  private slotSelectService = inject(SlotSelectionService);

  handleSlotPointerDown(e: { event: PointerEvent, slot: ArtistPerformanceSlot }) {
    const { event, slot } = e;

    this.selectSlot(slot, event);
    this.startSlotDrag(event, slot);
  }

  private selectSlot(slot: ArtistPerformanceSlot, event: PointerEvent) {
    this.slotSelectService.handleSlotPointerDown(
      slot.id,
      slot.room_id,
      event
    );
  };

  // --------------------------------------- CUES ----------------------//
  private cueSelectService = inject(CueSelectionService);

  handleCuePointerDown(event: PointerEvent, cue: TimelineCue) {
    const orderedIds =
      this.selector.cuesByRoom().get(cue.roomId)?.map(c => c.id) ?? [];
    this.cueSelectService.select(cue.id, orderedIds, event);
    this.startCueDrag(event, cue);
  }

  private startCueDrag(event: PointerEvent, cue: TimelineCue) {
    this.interaction.startCueDrag(event, cue);
  }


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

  private dragInteraction = inject(SlotDragInteractionService);
  private resizeInteraction = inject(ResizeInteractionService);
  private cueDragInteraction = inject(CueDragInteractionService);

  @HostListener('document:pointerup')
  onPointerUp() {
    if (this.dragInteraction.isActive()) {
      this.interaction.stop();
      return;
    }

    if (this.resizeInteraction.isActive()) {
      this.interaction.stop();
      return;
    }

    if (this.cueDragInteraction.isActive()) {
      this.interaction.stop();
      return;
    }
  };

  /**
   * When clicking on a non slot element, removes selection of slots
   * @param event
   */
  @HostListener('document:pointerdown', ['$event'])
  clearSelection(event: PointerEvent) {

    const el = event.target as HTMLElement;

    if (!el.closest('[data-selectable]')) {
      this.slotSelectService.clear();
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



  //BUFFER - WORKFLOW REWORK
  startBufferResize(event: PointerEvent, buffer: TimelineBuffer) {
    this.interaction.startResize(event, {
      id: buffer.id,
      roomId: buffer.id,
      startMinutes: buffer.atMinutes,
      duration: buffer.delta,
      type: ResizeTargetType.BUFFER,
    });
  }

}
