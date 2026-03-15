import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
  inject,
  type OnInit,
} from '@angular/core';

import { PerformanceSlotComponent } from '../performance-slot/performance-slot.component';
import { ProgramHeaderComponent } from '../program-header/program-header.component';

import {
  TimelineInteractionService
} from '../services/timeline-interaction.service';

import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../program-side-panel/program-side-panel.component';
import { TimeMarkersComponent } from '../time-markers/time-markers.component';

import { time_functions_utils } from '../utils/time_functions_utils';
import {
  mockPerformanceSlotsTemplates,
} from '../utils/mockDATAS';
import { DragSessionService } from '../../../core/drag-and-drop/drag-session.service';
import { SlotHoverService } from '../services/drag-interactions/slot-hover.service';
import type {
  PlannerArtist,
  UserGroup,
  ArtistPerformanceSlot,
  ArtistPerformanceSlotTemplate,
} from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import {
  EditPerformanceSlotPopoverComponent
} from '../edit-performance-slot-popover/edit-performance-slot-popover.component';
import { RoomService } from '../services/planner-state-mutations/room.service';
import { SlotService } from '../services/planner-state-mutations/slot.service';
import { PlannerSelectorService } from '../services/planner-selector.service';
import { BufferSlotComponent } from '../bufferblock/buffer-slot.component';
import { ArtistCardComponent } from '../artist-card/artist-card.component';
import { GroupCardComponent } from '../group-card/group-card.component';
import { PlannerDndInitService } from '../services/planner-dn-dinit.service';
import { DndDropZoneDirective } from '../../../core/drag-and-drop/dnd-drop-zone.directive';


@Component({
  selector: 'app-programs-page',
  imports: [
    PerformanceSlotComponent,
    ProgramHeaderComponent,
    TimeMarkersComponent,
    BufferSlotComponent,
    DndDropZoneDirective,
  ],
  templateUrl: './programs-page.component.html',
  styleUrl: './programs-page.component.scss'
})
export class ProgramsPageComponent implements OnInit {

  private selector = inject(PlannerSelectorService);

  public roomServ = inject(RoomService);
  public slotServ = inject(SlotService);

  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService)
  private interaction = inject(TimelineInteractionService);
  private hover = inject(SlotHoverService);
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
      onTemplateDragStart: (t: ArtistPerformanceSlotTemplate) => this.startTemplateDrag(t),
      onArtistDragStart: (a: PlannerArtist) => this.startArtistDrag(a),
      onGroupDragStart: (g: UserGroup) => this.startGroupDrag(g)
    });
  };

  /* ---------------- TIME UTILS ---------------- */
  get timelineHeight(): number {
    return this.res.minuteToPx(this.selector.totalMinutes());
  };

  get gridOffsetPx(): number {
    const startMinutes = time_functions_utils(this.selector.startTime());

    return this.res.computeGridOffset(startMinutes);
  };

  getSlotHeight(minutes: number): number {
    return this.res.minuteToPx(minutes);
  };

  /* ---------------- TEMPLATE DRAG ---------------- */
  startTemplateDrag(template: ArtistPerformanceSlotTemplate) {
    this.drag.start({ type: 'template', data: template });
  };

  private handleTemplateMove(event: PointerEvent) {

    if (!this.roomLayers) {
      return;
    }

    for (const layer of this.roomLayers.toArray()) {

      const rect = layer.nativeElement.getBoundingClientRect();

      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        const offsetY = event.clientY - rect.top;

        this.previewTop = this.res.computePreviewTop(offsetY);

        this.previewRoomId = layer.nativeElement.dataset['roomId'];
      }
    }
  };

  private handleTemplateDrop() {

    const drag = this.drag.current();

    if (drag?.type !== 'template') {
      return;
    }

    if (!this.previewRoomId) {
      return;
    }

    const startMinutes = this.res.pxToMinutes(this.previewTop);

    this.slotServ.addSlot({
      id: crypto.randomUUID(),
      name: drag.data.name,
      startMinutes,
      duration: drag.data.duration,
      type: drag.data.type,
      color: drag.data.color,
      roomId: this.previewRoomId,
      artists: [],
      playlist: drag.data.playlist,
      song: drag.data.song
    });
  };

  /* ---------------- ARTIST DRAG ---------------- */
  startArtistDrag(data: PlannerArtist) {
    this.drag.start({ type: 'artist', data, preview: ArtistCardComponent });
  };

  /**
   * Handles dropping an artist onto a performance slot.
   * If the current drag session is of type 'artist' and there is a hovered slot, adds the artist to that slot.
   * @private
   */
  private handleArtistDrop() {

    const drag = this.drag.current();
    const slotId = this.drag.getDropTarget<string>();

    if (drag?.type !== 'artist' || !slotId) {
      return;
    }

    this.slotServ.addArtistToSlot(slotId, drag.data);
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

  /*
  private handleRoomChange(event: PointerEvent) {

    const drag = this.drag.current();

    if (drag?.type !== 'slot') {
      return;
    }

    for (const layer of this.roomLayers.toArray()) {

      const rect = layer.nativeElement.getBoundingClientRect();

      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right
      ) {
        const newRoomId = layer.nativeElement.dataset['roomId'];

        if (
          newRoomId &&
          drag.data.roomId !== newRoomId
        ) {
          this.slotServ.updateSlotRoom(drag.data.id, newRoomId);        }
      }
    }
  };

   */
  private handleRoomChange() {

    const drag = this.drag.current();
    if (drag?.type !== 'slot') {
      console.log('error')
      return;
    }

    const roomId = this.drag.getDropTarget<string>();
    console.log('roomId', roomId);

    if (!roomId) {
      return;
    }

    if (drag.data.roomId !== roomId) {
      this.slotServ.updateSlotRoom(drag.data.id, roomId);
    }
  };

  /* ---------------- GLOBAL EVENTS ---------------- */

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    const drag = this.drag.current();

    if (!drag) {
      return;
    }

    this.drag.updatePointer(event);

    switch (drag.type) {

      //TODO : se débarrasser de template
      case 'template':
        this.handleTemplateMove(event);
        break;

      case 'slot':
        //this.handleRoomChange(event);
        this.handleRoomChange();
        break;
    }

    this.interaction.handlePointerMove(event);
  }

  @HostListener('document:pointerup')
  onPointerUp() {

    const drag = this.drag.current();

    if (!drag) {
      return;
    }

    switch (drag.type) {
      case 'template':
        this.handleTemplateDrop();
        break;
      case 'artist':
        this.handleArtistDrop();
        break;
      case 'group':
        this.handleGroupDrop();
        break;
    }

    this.previewRoomId = undefined;

    this.hover.clear();
    this.interaction.stop();
  }

  /* ---------------- ROOMS ---------------- */

  /**
   * Returns an array of performance slots that are scheduled in a specific room, identified by the provided roomId.
   * @param roomId
   */
  getSlotsForRoom(roomId: string) {
    return this.selector.slotsByRoom().get(roomId) ?? [];
  }

  get previewTemplate(): ArtistPerformanceSlotTemplate | undefined {
    const drag = this.drag.current();

    return drag?.type === 'template'
      ? drag.data
      : undefined;
  }

  //* ---------------- ARTIST GROUP DRAG ---------------- *//
  private handleGroupDrop() {
    const drag = this.drag.current();

    if (drag?.type !== 'group') {
      return;
    }

    const hoveredSlot = this.hover.hovered();

    if (!hoveredSlot) {
      return;
    }

    this.slotServ.addGroupToSlot(hoveredSlot.id, drag.data)
  };

  /**
   * Initiates a drag session for an artist group. When a user starts dragging an artist group, this method is called with the group as an argument. It uses the DragSessionService to start a new drag session, passing an object that indicates the type of item being dragged (in this case, 'group') and the group itself. This allows the application to manage the drag state and provide appropriate feedback to the user during the drag operation.
   * @param data
   */
  startGroupDrag(data: UserGroup) {
    this.drag.start({ type: 'group', data, preview: GroupCardComponent });
  };

  openEditPerformanceSlotPopover(slot_id: string) {
    this.layout.setPopover(EditPerformanceSlotPopoverComponent, { id: slot_id });
  };
}
