import { Component, ElementRef, HostListener, inject, input, output } from '@angular/core';
import {EventBlockComponent} from '../eventBlock/event-block.component';
import { NgStyle } from '@angular/common';
import type { TEventUnitDomainModel } from '@sh3pherd/shared-types';


const PX_PER_MINUTE = 3;
const DEFAULT_DURATION_MIN = 30;

@Component({
  selector: 'app-planningGrid',
  standalone: true,
  imports: [EventBlockComponent, NgStyle],
  templateUrl: './planning-grid.component.html',
  styleUrl: './planning-grid.component.scss',
})
export class PlanningGridComponent {
  /* =========================
   * Inputs / Outputs
   * ========================= */

  readonly events = input.required<TEventUnitDomainModel[]>();

  /** Émission vers le parent (source of truth) */
  readonly createEvent = output<Partial<TEventUnitDomainModel>>();

  /* =========================
   * DOM
   * ========================= */

  private readonly hostEl = inject(ElementRef<HTMLElement>);

  /* =========================
   * Rendering
   * ========================= */

  getEventStyle(event: TEventUnitDomainModel): Record<string, string> {
    const startMin = this.minutesFromStartOfDay(event.startDate);
    const endMin = this.minutesFromStartOfDay(event.endDate);

    return {
      top: `${startMin * PX_PER_MINUTE}px`,
      height: `${(endMin - startMin) * PX_PER_MINUTE}px`,
      position: 'absolute',
    };
  }

  /* =========================
   * Interaction
   * ========================= */

  @HostListener('dblclick', ['$event'])
  onHostDblClick(event: MouseEvent): void {
    const host = this.hostEl.nativeElement;
    const rect = host.getBoundingClientRect();

    const offsetY = event.clientY - rect.top + host.scrollTop;
    const minutes = offsetY / PX_PER_MINUTE;
    const snapped = this.snapTo5(minutes);

    const startDate = this.dateFromMinutes(snapped);
    const endDate = this.dateFromMinutes(snapped + DEFAULT_DURATION_MIN);

    console.log('Creating event at', startDate, 'to', endDate);

    this.createEvent.emit({
      startDate,
      endDate,
    });
  }

  /* =========================
   * Utils
   * ========================= */

  private minutesFromStartOfDay(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  private snapTo5(minutes: number): number {
    return Math.round(minutes / 5) * 5;
  }

  private dateFromMinutes(minutes: number): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(minutes);
    return date;
  }
}
