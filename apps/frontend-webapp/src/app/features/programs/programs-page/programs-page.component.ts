import {
  Component,
  type ElementRef,
  HostListener,
  inject,
  type OnInit,
  type QueryList,
  ViewChildren,
} from '@angular/core';
import { PerformanceSlotComponent } from '../performance-slot/performance-slot.component';
import { ProgramHeaderComponent } from '../program-header/program-header.component';
import {
  type PerformanceSlot, type PerformanceTemplate,
  ProgramStateService, type Room,
} from '../program-state.service';
import { TimelineInteractionService } from '../timeline-interaction.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ProgramSidePanelComponent } from '../program-side-panel/program-side-panel.component';


@Component({
  selector: 'app-programs-page',
  imports: [
    PerformanceSlotComponent,
    ProgramHeaderComponent,
  ],
  templateUrl: './programs-page.component.html',
  styleUrl: './programs-page.component.scss'
})
export class ProgramsPageComponent implements OnInit {
  private state = inject(ProgramStateService);
  private interaction = inject(TimelineInteractionService);
  private layout = inject(LayoutService)

  templates: PerformanceTemplate[] = [
    { id: 't1', name: 'PBO', duration: 15, type: 'PBO', color: '#d066ed' },
    { id: 't2', name: 'Cabaret', duration: 15, type: 'CABARET', color: '#f19010' },
    { id: 't3', name: 'Aerial', duration: 5, type: 'AERIAL', color: '#66eda1' },
    { id: 't4', name: 'Club', duration: 15, type: 'CLUB_ROTATION', color: '#66b9ed' },
    { id: 't5', name: 'FINAL', duration: 5, type: 'FINAL', color: '#66ceed' }
  ];

  ngOnInit() {
    this.layout.setRightPanel(ProgramSidePanelComponent, {
      templates: this.templates,
      onTemplateDragStart: (template: any) => this.startTemplateDrag(template),
    });
  }


  get rooms() {
    return this.state.rooms;
  }

  get slots() {
    return this.state.slots;
  }

  get programName() {
    return this.state.program.name;
  }
  set programName(value: string) {
    this.state.setName(value);
  }

  get programStart() {
    return this.state.program.startTime;
  }
  set programStart(value: string) {
    this.state.setStart(value);
  }

  get programEnd() {
    return this.state.program.endTime;
  }
  set programEnd(value: string) {
    this.state.setEnd(value);
  }



  /* ---------------------------------------------------
     VIEW CHILDREN (ROOM LAYERS)
  --------------------------------------------------- */
  @ViewChildren('roomLayer')
  roomLayers!: QueryList<ElementRef<HTMLDivElement>>;

  readonly PIXELS_PER_MINUTE = 5;
  readonly SNAP_MINUTES = 5;

  // ---- UTILS TIME ----
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  get totalMinutes(): number {
    const start = this.timeToMinutes(this.programStart);
    let end = this.timeToMinutes(this.programEnd);

    if (end <= start) {
      end += 24 * 60;
    }

    return end - start;
  }

  get timelineHeight(): number {
    return this.totalMinutes * this.PIXELS_PER_MINUTE;
  }

  get timeMarkers(): number[] {
    return Array.from(
      { length: this.totalMinutes / 5 + 1 },
      (_, i) => i * 5
    );
  }

  formatTime(offsetMinutes: number): string {

    const start = this.timeToMinutes(this.programStart);
    let absolute = start + offsetMinutes;

    absolute = absolute % (24 * 60);

    const hours = Math.floor(absolute / 60);
    const mins = absolute % 60;

    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate the pixel offset for the grid based on the program's start time.
    This ensures that the time markers align correctly with the actual times.
   */
  get gridOffsetPx(): number {
    const startMinutes = this.timeToMinutes(this.programStart);

    // On veut l'offset dans une heure
    const minuteWithinHour = startMinutes % 60;

    return minuteWithinHour * this.PIXELS_PER_MINUTE;
  }


  //SLOT TIME
  private minutesToTime(totalMinutes: number): string {
    totalMinutes = totalMinutes % (24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  getSlotStartTime(slot: PerformanceSlot): string {
    const programStartMinutes = this.timeToMinutes(this.programStart);
    const absolute = programStartMinutes + slot.startMinutes;
    return this.minutesToTime(absolute);
  }

  getSlotEndTime(slot: PerformanceSlot): string {
    const programStartMinutes = this.timeToMinutes(this.programStart);
    const absolute =
      programStartMinutes + slot.startMinutes + slot.duration;
    return this.minutesToTime(absolute);
  }

  draggingTemplate?: PerformanceTemplate;
  previewTop = 0;

  startTemplateDrag(template: PerformanceTemplate) {
    this.draggingTemplate = template;
  }


  /**
   * Handle mouse up events on the document to finalize the dragging of a performance template. If a template is being dragged and a valid preview room is set, this method calculates the start time based on the preview position and creates a new performance slot in the state with the properties of the dragged template. After handling the drop, it resets the dragging state and stops any ongoing interactions.
   * @param _event
   */
  @HostListener('document:mouseup', ['$event'])
  onMouseUp(_event: MouseEvent) {

    // ----- DROP TEMPLATE -----
    if (this.draggingTemplate && this.previewRoomId) {

      const startMinutes =
        this.previewTop / this.PIXELS_PER_MINUTE;

      this.state.addSlot({
        id: crypto.randomUUID(),
        startMinutes,
        duration: this.draggingTemplate.duration,
        type: this.draggingTemplate.type,
        color: this.draggingTemplate.color,
        roomId: this.previewRoomId,
        artistIds: []
      });
    }

    // ----- RESET -----
    this.draggingTemplate = undefined;
    this.previewRoomId = undefined;

    this.interaction.stop();
  }

  /**
   * Handle mouse move events on the document to manage dragging of performance templates and existing slots. This method checks if a template is being dragged and updates the preview position accordingly. It also handles vertical dragging and resizing of existing slots, as well as horizontal room changes when dragging a slot across different room layers.
   * @param event
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {

    // 1️----- DRAG TEMPLATE -----
    if (this.draggingTemplate && this.roomLayers) {

      for (const layer of this.roomLayers.toArray()) {

        const rect = layer.nativeElement.getBoundingClientRect();

        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          const offsetY = event.clientY - rect.top;

          const rawMinutes = offsetY / this.PIXELS_PER_MINUTE;
          const snapped =
            Math.round(rawMinutes / this.SNAP_MINUTES) * this.SNAP_MINUTES;

          this.previewTop = Math.max(0, snapped * this.PIXELS_PER_MINUTE);

          this.previewRoomId =
            layer.nativeElement.dataset['roomId'];
        }
      }
    }

    // 2️⃣ Vertical drag + resize
    this.interaction.handleMouseMove(event);

    // 3️⃣ Horizontal room change
    const draggingSlot = this.interaction.currentDraggingSlot;

    if (draggingSlot && this.roomLayers) {
      for (const layer of this.roomLayers.toArray()) {

        const rect = layer.nativeElement.getBoundingClientRect();

        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right
        ) {
          const newRoomId =
            layer.nativeElement.dataset['roomId'];

          if (
            newRoomId &&
            draggingSlot.roomId !== newRoomId
          ) {
            draggingSlot.roomId = newRoomId;
          }
        }
      }
    }
  }

  //DRAG EXISTING SLOTS
  /**
   * Start dragging an existing performance slot. If the ALT key is held during the drag, a duplicate of the slot will be created and dragged instead.
   *
   * This method checks if the ALT key is pressed when initiating the drag. If it is, it creates a copy of the slot with a new unique ID and the same properties, adds it to the state, and starts dragging the copy. If the ALT key is not pressed, it simply starts dragging the original slot.
   * @param event
   * @param slot
   */
  startSlotDrag(event: MouseEvent, slot: PerformanceSlot) {

    // ALT = duplication
    if (event.altKey) {

      const copy: PerformanceSlot = {
        ...slot,
        id: crypto.randomUUID(),
        artistIds: [...(slot.artistIds ?? [])]
      };

      this.state.addSlot(copy);

      this.interaction.startSlotDrag(event, copy);
      return;
    }

    // Drag normal
    this.interaction.startSlotDrag(event, slot);
  }



  // --- RESIZER SLOT ---
  startSlotResize(event: MouseEvent, slot: PerformanceSlot) {
    this.interaction.startSlotResize(event, slot);
  }

  /* ---------------------------------------------------
   ROOMS
--------------------------------------------------- */
  previewRoomId?: string;

  getSlotsForRoom(roomId: string): PerformanceSlot[] {
    return this.slots.filter(s => s.roomId === roomId);
  };

  addRoom() {
    this.state.addRoom(`Room ${this.rooms.length + 1}`);
  };


  isBaseRoom(room: Room): boolean {
    return this.rooms[0]?.id === room.id;
  }

  removeRoom(roomId: string) {
    this.state.removeRoom(roomId);
  }
}
