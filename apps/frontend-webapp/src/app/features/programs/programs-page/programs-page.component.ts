import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
  inject,
  type OnInit
} from '@angular/core';

import { PerformanceSlotComponent } from '../performance-slot/performance-slot.component';
import { ProgramHeaderComponent } from '../program-header/program-header.component';
import { ProgramStateService } from '../services/program-state.service';

import {
  TimelineInteractionService
} from '../services/timeline-interaction.service';

import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../program-side-panel/program-side-panel.component';
import { TimeMarkersComponent } from '../time-markers/time-markers.component';

import { time_functions_utils } from '../utils/time_functions_utils';
import {
  mockPerformanceSlotsTemplates, mockArtistGroups, AllMockArtists,
} from '../utils/mockDATAS';
import { DragSessionService } from '../services/drag-session.service';
import { SlotHoverService } from '../services/slot-hover.service';
import type { Artist, ArtistGroup, ArtistPerformanceSlot, ArtistPerformanceSlotTemplate, Room } from '../program-types';
import { PlannerResolutionService } from '../services/planner-resolution.service';
import {
  EditPerformanceSlotPopoverComponent
} from '../edit-performance-slot-popover/edit-performance-slot-popover.component';

@Component({
  selector: 'app-programs-page',
  imports: [
    PerformanceSlotComponent,
    ProgramHeaderComponent,
    TimeMarkersComponent,
  ],
  templateUrl: './programs-page.component.html',
  styleUrl: './programs-page.component.scss'
})
export class ProgramsPageComponent implements OnInit {

  private state = inject(ProgramStateService);
  private drag = inject(DragSessionService);
  private res = inject(PlannerResolutionService)
  private interaction = inject(TimelineInteractionService);
  private hover = inject(SlotHoverService);

  private layout = inject(LayoutService);

  previewTop = 0;
  previewRoomId?: string;

  @ViewChildren('roomLayer') roomLayers!: QueryList<ElementRef<HTMLDivElement>>;

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit() {
    this.layout.setLeftPanel(ProgramSidePanelComponent, {
      templates: mockPerformanceSlotsTemplates,
      artists: AllMockArtists,
      groups: mockArtistGroups,
      onTemplateDragStart: (t: ArtistPerformanceSlotTemplate) => this.startTemplateDrag(t),
      onArtistDragStart: (a: Artist) => this.startArtistDrag(a),
      onGroupDragStart: (g: ArtistGroup) => this.startGroupDrag(g)
    });
  }

  /* ---------------- STATE SIGNALS ---------------- */
  rooms = this.state.rooms;
  slots = this.state.slots;

  /* ---------------- TIME UTILS ---------------- */
  get timelineHeight(): number {
    return this.res.minuteToPx(this.state.totalMinutes());
  };

  get gridOffsetPx(): number {

    const startMinutes = time_functions_utils(this.state.startTime());

    return this.res.computeGridOffset(startMinutes);
  }

  getSlotHeight(minutes: number): number {
    return this.res.minuteToPx(minutes);
  };

  /* ---------------- TEMPLATE DRAG ---------------- */
  startTemplateDrag(template: ArtistPerformanceSlotTemplate) {
    this.drag.start({ type: 'template', template });
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
  }

  private handleTemplateDrop() {

    const drag = this.drag.current();

    if (drag?.type !== 'template') {
      return;
    }

    if (!this.previewRoomId) {
      return;
    }

    const startMinutes = this.res.pxToMinutes(this.previewTop);

    this.state.addSlot({
      id: crypto.randomUUID(),
      startMinutes,
      duration: drag.template.duration,
      type: drag.template.type,
      color: drag.template.color,
      roomId: this.previewRoomId,
      artists: [],
      playlist: drag.template.playlist,
      song: drag.template.song
    });
  }

  /* ---------------- ARTIST DRAG ---------------- */
  startArtistDrag(artist: Artist) {
    this.drag.start({ type: 'artist', artist });
  }

  private handleArtistHover(event: PointerEvent) {

    const element = document.elementFromPoint(event.clientX, event.clientY);

    const slotElement = element?.closest('[data-slot-id]');

    if (!slotElement) {
      this.hover.clear();
      return;
    }

    const slotId = slotElement.getAttribute('data-slot-id');

    const slot = this.slots().find(s => s.id === slotId);

    this.hover.set(slot ?? null);
  }

  /**
   * Handles dropping an artist onto a performance slot.
   * If the current drag session is of type 'artist' and there is a hovered slot, adds the artist to that slot.
   * @private
   */
  private handleArtistDrop() {

    const drag = this.drag.current();

    if (drag?.type !== 'artist') {
      return;
    }

    const hoveredSlot = this.hover.hovered();

    if (!hoveredSlot) {
      return;
    }

    this.state.addArtistToSlot(hoveredSlot.id, drag.artist);
  }

  /* ---------------- SLOT DRAG / RESIZE ---------------- */

  startSlotDrag(event: PointerEvent, slot: ArtistPerformanceSlot): void {

    if (event.altKey) {
      const copy: ArtistPerformanceSlot = {
        ...slot,
        id: crypto.randomUUID(),
        artists: [...slot.artists]
      };

      this.state.addSlot(copy);
      this.interaction.startSlotDrag(event, copy);
      return;
    }

    this.interaction.startSlotDrag(event, slot);
  }

  startSlotResize(event: PointerEvent, slot: ArtistPerformanceSlot): void {
    this.interaction.startSlotResize(event, slot);
  }

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
          drag.slot.roomId !== newRoomId
        ) {
          this.state.updateSlotRoom(drag.slot.id, newRoomId);        }
      }
    }
  };

  /* ---------------- GLOBAL EVENTS ---------------- */

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {

    const drag = this.drag.current();

    if (!drag) {
      return;
    }

    switch (drag.type) {

      case 'template':
        this.handleTemplateMove(event);
        break;

      case 'artist':
        this.handleArtistHover(event);
        break;

      case 'slot':
        this.handleRoomChange(event);
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
  getSlotsForRoom(roomId: string): ArtistPerformanceSlot[] {
    return this.slots().filter(s => s.roomId === roomId);
  }

  isBaseRoom(room: Room): boolean {
    return this.rooms()[0]?.id === room.id;
  }

  removeRoom(roomId: string) {
    this.state.removeRoom(roomId);
  }

  get previewTemplate(): ArtistPerformanceSlotTemplate | undefined {
    const drag = this.drag.current();

    return drag?.type === 'template'
      ? drag.template
      : undefined;
  }

  //* ---------------- ARTIST GROUP DRAG ---------------- *//
  /**
   * Initiates a drag session for an artist group. When a user starts dragging an artist group, this method is called with the group as an argument. It uses the DragSessionService to start a new drag session, passing an object that indicates the type of item being dragged (in this case, 'group') and the group itself. This allows the application to manage the drag state and provide appropriate feedback to the user during the drag operation.
   * @param group
   */
  startGroupDrag(group: ArtistGroup) {
    this.drag.start({ type: 'group', group });
  };



  openEditPerformanceSlotPopover(slot_id: string) {
    this.layout.setPopover(EditPerformanceSlotPopoverComponent, { id: slot_id });
  };
}
