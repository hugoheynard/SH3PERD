import {
  Component,
  inject,
  type OnInit, HostListener, type AfterViewInit, computed, ViewChild, type ElementRef,
} from '@angular/core';

import { SlotPlannerComponent } from '../slot-planner/slot-planner.component';
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
import type {
  ArtistPerformanceSlot,
} from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import { EditPerformanceSlotPopoverComponent } from '../edit-performance-slot-popover/edit-performance-slot-popover.component';
import { SlotService } from '../services/planner-state-mutations/slot.service';
import { PlannerSelectorService } from '../services/planner-selector.service';
import { BufferSlotComponent } from '../bufferblock/buffer-slot.component';
import { PlannerDndInitService } from '../services/planner-dnd-init.service';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';
import type { DragState } from '../../../core/drag-and-drop/drag.types';
import { DndDragDirective } from '../../../core/drag-and-drop/dndDrag.directive';
import { RoomColumnComponent } from '../room-column/room-column.component';
import { SlotSelectionService } from '../services/slot-selection.service';
import { RoomLayoutRegistry } from '../services/room-layout-registry.service';
import { TimelineInteractionStore } from '../services/timeline-interaction.store';


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
  ],
  templateUrl: './programs-page.component.html',
  styleUrl: './programs-page.component.scss'
})
export class ProgramsPageComponent implements OnInit, AfterViewInit {

  public selector = inject(PlannerSelectorService);
  public slotServ = inject(SlotService);
  private res = inject(PlannerResolutionService)
  private interaction = inject(TimelineInteractionService);
  private interactionStore = inject(TimelineInteractionStore);
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

  draggingIds = computed(() =>
    this.interactionStore.draggingSlots()?.map(s => s.slotId) ?? []
  );

  /* ---------------- LIFECYCLE ---------------- */

  ngOnInit() {
    // set left side panel
    this.layout.setLeftPanel(ProgramSidePanelComponent, {
      templates: mockPerformanceSlotsTemplates,
      staff: this.selector.staff,
      groups: this.selector.userGroups,
    });

    //checks à delete
    console.log('total minutes', this.selector.totalMinutes());
  };

  /* ---------------- TIME UTILS ---------------- */
  @HostListener('document:pointermove', ['$event'])
  onPointerMove() {
    this.interaction.handlePointerMove();
  };

  @HostListener('document:pointerup')
  onPointerUp() {
    this.interaction.stop();
  };


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
  };

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot): void {
    this.interaction.startSlotResize(event, slot);
  };

  //* ---------------- DROP HANDLERS ---------------- *//

  handleRoomDrop(roomId: string, drag: DragState, offsetY: number) {

    if (drag.type === 'template') {

      const previewTop = this.res.computePreviewTop(offsetY, this.selector.gridOffsetPx());

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
  };

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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {

    const target = event.target as HTMLElement;

    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    /* DUPLICATE */

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {

      event.preventDefault();

      const ids = this.selection.getSelectedIds();

      ids.forEach(id => {

        const slot = this.selector.slotsById().get(id);
        if (!slot) {
          return;
        }

        this.slotServ.addSlot({
          ...slot,
          id: crypto.randomUUID(),
          startMinutes: slot.startMinutes + slot.duration,
        });

      });

      return;
    }

    /* DELETE */

    if (event.key === 'Delete' || event.key === 'Backspace') {

      event.preventDefault();

      const ids = this.selection.getSelectedIds();

      if (!ids.length) {
        return;
      }

      ids.forEach(id => this.slotServ.removeSlot(id));

      this.selection.clear();
    }
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

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.roomLayout.refresh();
    });
    this.plannerEl.nativeElement.addEventListener('scroll', () => {
      this.roomLayout.refresh();
    });
  }

  @ViewChild('planner', { static: true })
  plannerEl!: ElementRef;
}
