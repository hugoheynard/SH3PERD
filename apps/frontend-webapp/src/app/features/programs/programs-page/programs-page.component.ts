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
import type {
  Artist,
  PerformanceSlot,
  PerformanceTemplate,
  Room
} from '../services/program-state.service';
import { ProgramStateService } from '../services/program-state.service';

import {
  TimelineInteractionService
} from '../services/timeline-interaction.service';

import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../program-side-panel/program-side-panel.component';
import { TimeMarkersComponent } from '../time-markers/time-markers.component';

import { time_functions_utils } from '../utils/time_functions_utils';
import { PIXELS_PER_MINUTE } from '../utils/PROGRAM_CONSTS';
import {
  mockArtists_external,
  mockPerformanceSlotsTemplates
} from '../utils/mockDATAS';
import { DragSessionService } from '../services/drag-session.service';
import { SlotHoverService } from '../services/slot-hover.service';

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
  private interaction = inject(TimelineInteractionService);
  private hover = inject(SlotHoverService);

  private layout = inject(LayoutService);

  previewTop = 0;
  previewRoomId?: string;

  readonly SNAP_MINUTES = 5;

  @ViewChildren('roomLayer') roomLayers!: QueryList<ElementRef<HTMLDivElement>>;

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit() {
    this.layout.setRightPanel(ProgramSidePanelComponent, {
      templates: mockPerformanceSlotsTemplates,
      artists: mockArtists_external,
      onTemplateDragStart: (t: PerformanceTemplate) =>
        this.startTemplateDrag(t),
      onArtistDragStart: (a: Artist) =>
        this.startArtistDrag(a),
    });
  }

  /* ---------------- STATE SIGNALS ---------------- */
  rooms = this.state.rooms;
  slots = this.state.slots;

  /* ---------------- TIME UTILS ---------------- */
  get timelineHeight(): number {
    return this.state.totalMinutes() * PIXELS_PER_MINUTE;
  }

  get gridOffsetPx(): number {
    const startMinutes = time_functions_utils(this.state.startTime());
    const minuteWithinHour = startMinutes % 60;
    return minuteWithinHour * PIXELS_PER_MINUTE;
  }

  /* ---------------- TEMPLATE DRAG ---------------- */
  startTemplateDrag(template: PerformanceTemplate) {
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

        const rawMinutes = offsetY / PIXELS_PER_MINUTE;
        const snapped =
          Math.round(rawMinutes / this.SNAP_MINUTES) * this.SNAP_MINUTES;

        this.previewTop =
          Math.max(0, snapped * PIXELS_PER_MINUTE);

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

    const startMinutes =
      this.previewTop / PIXELS_PER_MINUTE;

    this.state.addSlot({
      id: crypto.randomUUID(),
      startMinutes,
      duration: drag.template.duration,
      type: drag.template.type,
      color: drag.template.color,
      roomId: this.previewRoomId,
      artists: []
    });
  }

  /* ---------------- ARTIST DRAG ---------------- */
  startArtistDrag(artist: Artist) {
    this.drag.start({ type: 'artist', artist });
  }

  private handleArtistHover(event: PointerEvent) {

    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    );

    const slotElement = element?.closest('[data-slot-id]');

    if (!slotElement) {
      this.hover.clear();
      return;
    }

    const slotId = slotElement.getAttribute('data-slot-id');

    const slot = this.slots().find(s => s.id === slotId);

    this.hover.set(slot ?? null);
  }

  private handleArtistDrop() {

    const drag = this.drag.current();

    if (drag?.type !== 'artist') {
      return;
    }

    const hoveredSlot = this.hover.hovered();

    if (!hoveredSlot) {
      return;
    }

    this.state.addArtistToSlot(
      hoveredSlot.id,
      drag.artist
    );
  }

  /* ---------------- SLOT DRAG / RESIZE ---------------- */

  startSlotDrag(event: PointerEvent, slot: PerformanceSlot): void {

    if (event.altKey) {
      const copy: PerformanceSlot = {
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

  startSlotResize(event: PointerEvent, slot: PerformanceSlot): void {
    this.interaction.startSlotResize(event, slot);
  }

  private handleRoomChange(event: PointerEvent) {

    const drag = this.drag.current();

    if (drag?.type !== 'slot') {
      return;
    }

    for (const layer of this.roomLayers.toArray()) {

      const rect =
        layer.nativeElement.getBoundingClientRect();

      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right
      ) {
        const newRoomId =
          layer.nativeElement.dataset['roomId'];

        if (
          newRoomId &&
          drag.slot.roomId !== newRoomId
        ) {
          drag.slot.roomId = newRoomId;
        }
      }
    }
  }

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

  getSlotsForRoom(roomId: string): PerformanceSlot[] {
    return this.slots().filter(s => s.roomId === roomId);
  }

  isBaseRoom(room: Room): boolean {
    return this.rooms()[0]?.id === room.id;
  }

  removeRoom(roomId: string) {
    this.state.removeRoom(roomId);
  }

  protected readonly PIXELS_PER_MINUTE = PIXELS_PER_MINUTE;

  get previewTemplate(): PerformanceTemplate | undefined {
    const drag = this.drag.current();

    return drag?.type === 'template'
      ? drag.template
      : undefined;
  }
}
