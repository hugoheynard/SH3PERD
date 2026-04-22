import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

export type TargetFillState = 'empty' | 'under' | 'near' | 'over';

/**
 * Label + editable target duration + fill-% progress bar, shared by
 * the show header ("Total target") and every section footer
 * ("Target"). Callers pass the target + actual seconds as raw inputs;
 * the component handles its own edit state, parses the minutes draft
 * on commit, and emits only valid changes so the caller can just
 * forward to its mutation service.
 */
@Component({
  selector: 'app-target-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IconComponent],
  templateUrl: './target-bar.component.html',
  styleUrl: './target-bar.component.scss',
  host: {
    '[attr.data-state]': 'fillState()',
  },
})
export class TargetBarComponent {
  /** Chip label ("Target", "Total target"). */
  readonly label = input.required<string>();

  /** Current target in seconds, or `null` when no target is set. */
  readonly targetSeconds = input<number | null>(null);

  /** Current actual duration in seconds — drives the fill %. */
  readonly actualSeconds = input.required<number>();

  /** `<input type="number" step>` — shows default 1, show-level
   *  editors pass 5 to snap to 5-minute multiples. */
  readonly stepMinutes = input(1);

  readonly ariaLabel = input('Duration target in minutes');

  /** Fires with the new target in minutes on a valid commit. No
   *  emission on empty / zero / unchanged input. */
  readonly commitMinutes = output<number>();

  protected readonly editing = signal(false);
  protected readonly draft = signal('');

  protected readonly targetMinutes = computed<number | null>(() => {
    const s = this.targetSeconds();
    return s !== null && s > 0 ? Math.round(s / 60) : null;
  });

  protected readonly ratio = computed<number | null>(() => {
    const t = this.targetSeconds();
    if (t === null || t <= 0) return null;
    return this.actualSeconds() / t;
  });

  protected readonly fillState = computed<TargetFillState>(() => {
    const r = this.ratio();
    if (r === null || r === 0) return 'empty';
    if (r < 0.9) return 'under';
    if (r <= 1.05) return 'near';
    return 'over';
  });

  protected readonly fillPercent = computed<string | null>(() => {
    const r = this.ratio();
    return r === null ? null : `${Math.round(r * 100)}%`;
  });

  protected readonly fillWidth = computed<string>(() => {
    const r = this.ratio();
    if (r === null) return '0%';
    return `${Math.min(1, Math.max(0, r)) * 100}%`;
  });

  protected readonly targetLabel = computed<string | null>(() => {
    const m = this.targetMinutes();
    return m === null ? null : formatMinutes(m);
  });

  protected readonly actualLabel = computed<string>(() =>
    formatMinutes(Math.round(this.actualSeconds() / 60)),
  );

  startEdit(): void {
    this.draft.set(String(this.targetMinutes() ?? 15));
    this.editing.set(true);
  }

  commit(): void {
    const raw = this.draft().trim();
    this.editing.set(false);
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    if (parsed === this.targetMinutes()) return;
    this.commitMinutes.emit(parsed);
  }

  cancel(): void {
    this.editing.set(false);
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
    }
  }
}

function formatMinutes(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
}
