import { Component, input, output, computed } from '@angular/core';

export type RangeValue = { min: number; max: number };

@Component({
  selector: 'sh3-range-slider',
  standalone: true,
  template: `
    <div class="range-slider">
      <span class="range-label">{{ label() }}</span>
      <div class="range-track-wrapper">
        <div class="range-track">
          <div class="range-fill" [style.left.%]="fillLeft()" [style.width.%]="fillWidth()"></div>
        </div>
        <input
          type="range"
          class="range-thumb range-thumb--min"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="currentMin()"
          (input)="onMinChange($event)"
        />
        <input
          type="range"
          class="range-thumb range-thumb--max"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [value]="currentMax()"
          (input)="onMaxChange($event)"
        />
      </div>
      <span class="range-values">{{ formatValue(currentMin()) }} – {{ formatValue(currentMax()) }}</span>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .range-slider {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .range-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
    }

    .range-track-wrapper {
      position: relative;
      height: 20px;
    }

    .range-track {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 4px;
      transform: translateY(-50%);
      background: var(--border-subtle);
      border-radius: 2px;
    }

    .range-fill {
      position: absolute;
      height: 100%;
      background: var(--accent-color, #6366f1);
      border-radius: 2px;
    }

    .range-thumb {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      pointer-events: none;
      outline: none;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--accent-color-light, #818cf8);
        border: 2px solid var(--panel-color, #171c23);
        cursor: pointer;
        pointer-events: auto;
        transition: transform 0.1s ease;

        &:hover { transform: scale(1.2); }
      }

      &::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--accent-color-light, #818cf8);
        border: 2px solid var(--panel-color, #171c23);
        cursor: pointer;
        pointer-events: auto;

        &:hover { transform: scale(1.2); }
      }
    }

    .range-values {
      font-size: 10px;
      font-weight: 500;
      color: var(--text-muted);
      text-align: center;
      font-variant-numeric: tabular-nums;
    }
  `],
})
export class RangeSliderComponent {

  readonly label = input.required<string>();
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly value = input<RangeValue | undefined>(undefined);
  readonly unit = input<'number' | 'duration'>('number');

  readonly valueChange = output<RangeValue>();

  readonly currentMin = computed(() => this.value()?.min ?? this.min());
  readonly currentMax = computed(() => this.value()?.max ?? this.max());

  readonly fillLeft = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) return 0;
    return ((this.currentMin() - this.min()) / range) * 100;
  });

  readonly fillWidth = computed(() => {
    const range = this.max() - this.min();
    if (range === 0) return 100;
    return ((this.currentMax() - this.currentMin()) / range) * 100;
  });

  formatValue(val: number): string {
    if (this.unit() === 'duration') {
      const m = Math.floor(val / 60);
      const s = val % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
    return String(val);
  }

  onMinChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    const clamped = Math.min(val, this.currentMax());
    this.valueChange.emit({ min: clamped, max: this.currentMax() });
  }

  onMaxChange(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    const clamped = Math.max(val, this.currentMin());
    this.valueChange.emit({ min: this.currentMin(), max: clamped });
  }
}
