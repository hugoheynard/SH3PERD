import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type {
  TPlaylistColor,
  TShowAxisCriterion,
  TShowAxisKey,
  TShowId,
} from '@sh3pherd/shared-types';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { LayoutService } from '../../../core/services/layout.service';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ShowsStateService } from '../services/shows-state.service';
import { ShowMutationService } from '../services/mutations-layer/show-mutation.service';

export interface ShowSettingsPopoverData {
  showId: TShowId;
}

type TargetMode = 'none' | 'duration' | 'track_count';

const SHOW_COLORS = [
  { key: 'indigo', hex: '#818cf8' },
  { key: 'emerald', hex: '#34d399' },
  { key: 'rose', hex: '#fb7185' },
  { key: 'amber', hex: '#fbbf24' },
  { key: 'sky', hex: '#38bdf8' },
  { key: 'violet', hex: '#a78bfa' },
] as const;

const AXIS_ROWS: {
  key: TShowAxisKey;
  label: string;
  accent: string;
}[] = [
  { key: 'mastery', label: 'MST', accent: 'var(--color-rating-high, #4ade80)' },
  { key: 'energy', label: 'NRG', accent: 'var(--color-rating-max, #fbbf24)' },
  {
    key: 'effort',
    label: 'EFF',
    accent: 'var(--color-rating-medium, #38bdf8)',
  },
  { key: 'quality', label: 'QTY', accent: 'var(--color-rating-low, #a78bfa)' },
];

interface AxisDraft {
  enabled: boolean;
  min: string;
  max: string;
}

/**
 * Edit every show-level setting in one panel — replaces the scattered
 * inline-edit buttons on the show header. Pre-fills from the current
 * detail state, submits via `ShowMutationService.updateShow` which
 * re-fetches the detail so the header view refreshes authoritatively.
 *
 * Target mode is the one tricky field — a show can have at most one
 * target (duration OR track count). The popover enforces that in the
 * UI; on submit it sends `null` to the "other" field so the backend
 * clears the previous value. `none` clears both.
 */
@Component({
  selector: 'app-show-settings-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PopoverFrameComponent, ButtonComponent, IconComponent],
  templateUrl: './show-settings-popover.component.html',
  styleUrl: './show-settings-popover.component.scss',
})
export class ShowSettingsPopoverComponent implements OnInit {
  private readonly data = inject(INJECTION_DATA) as ShowSettingsPopoverData;
  private readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly colors = SHOW_COLORS;
  protected readonly axisRows = AXIS_ROWS;

  /** Form drafts. Kept as raw strings for number inputs so the fields
   *  stay untouched as the user types — parsed + validated at submit. */
  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly color = signal<TPlaylistColor>('indigo');
  protected readonly targetMode = signal<TargetMode>('none');
  protected readonly targetDurationMinutes = signal('60');
  protected readonly targetTrackCount = signal('10');
  /** `YYYY-MM-DD` (HTML date input native format). Empty = no schedule. */
  protected readonly startAtDate = signal('');
  /** `HH:mm` (HTML time input native format). Empty = all-day / no time. */
  protected readonly startAtTime = signal('');
  /** Per-axis criterion draft — four fixed rows, each individually
   *  enabled, with independent min / max inputs. */
  protected readonly axes = signal<Record<TShowAxisKey, AxisDraft>>({
    mastery: { enabled: false, min: '1', max: '4' },
    energy: { enabled: false, min: '1', max: '4' },
    effort: { enabled: false, min: '1', max: '4' },
    quality: { enabled: false, min: '1', max: '4' },
  });

  protected readonly canSubmit = computed(() => this.name().trim().length > 0);

  ngOnInit(): void {
    const show = this.state.detail();
    if (!show || show.id !== this.data.showId) return;
    this.name.set(show.name);
    this.description.set(show.description ?? '');
    this.color.set(show.color);

    if (show.totalDurationTargetSeconds) {
      this.targetMode.set('duration');
      this.targetDurationMinutes.set(
        String(Math.round(show.totalDurationTargetSeconds / 60)),
      );
    } else if (show.totalTrackCountTarget) {
      this.targetMode.set('track_count');
      this.targetTrackCount.set(String(show.totalTrackCountTarget));
    } else {
      this.targetMode.set('none');
    }

    if (show.startAt) {
      const d = new Date(show.startAt);
      this.startAtDate.set(toDateInput(d));
      this.startAtTime.set(toTimeInput(d));
    }

    const draft = { ...this.axes() };
    for (const c of show.axisCriteria ?? []) {
      draft[c.axis] = {
        enabled: true,
        min: c.min !== undefined ? String(c.min) : '1',
        max: c.max !== undefined ? String(c.max) : '4',
      };
    }
    this.axes.set(draft);
  }

  setColor(color: TPlaylistColor): void {
    this.color.set(color);
  }

  setTargetMode(mode: TargetMode): void {
    this.targetMode.set(mode);
  }

  updateAxis(key: TShowAxisKey, patch: Partial<AxisDraft>): void {
    this.axes.update((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }

  close(): void {
    this.layout.clearPopover();
  }

  submit(): void {
    const name = this.name().trim();
    if (!name) return;

    const description = this.description().trim();

    // Target: exactly one of duration / track_count may be set;
    // the other is cleared explicitly on every submit so state can
    // transition cleanly (duration → track_count → none → etc.).
    const mode = this.targetMode();
    const totalDurationTargetSeconds =
      mode === 'duration'
        ? parsePositiveInt(this.targetDurationMinutes()) * 60 || null
        : null;
    const totalTrackCountTarget =
      mode === 'track_count'
        ? parsePositiveInt(this.targetTrackCount()) || null
        : null;

    const startAt = parseDateTime(this.startAtDate(), this.startAtTime());

    const criteria = this.buildCriteria();

    this.mutations.updateShow(this.data.showId, {
      name,
      description,
      color: this.color(),
      totalDurationTargetSeconds:
        totalDurationTargetSeconds ?? (mode === 'duration' ? undefined : null),
      totalTrackCountTarget:
        totalTrackCountTarget ?? (mode === 'track_count' ? undefined : null),
      startAt: startAt ?? null,
      axisCriteria: criteria,
    });
    this.close();
  }

  /** Build the axis criteria array from the enabled rows. Empty array
   *  is sent when none are enabled so the backend clears previous
   *  criteria on this submit. */
  private buildCriteria(): TShowAxisCriterion[] {
    const out: TShowAxisCriterion[] = [];
    const axes = this.axes();
    for (const row of AXIS_ROWS) {
      const draft = axes[row.key];
      if (!draft.enabled) continue;
      const min = parseRating(draft.min);
      const max = parseRating(draft.max);
      // Skip rows with no meaningful bound — the criterion would be
      // tautological and only bloat the storage.
      if (min === undefined && max === undefined) continue;
      // Guard against inverted bounds — the backend Zod refine would
      // reject the whole payload otherwise.
      if (min !== undefined && max !== undefined && min > max) continue;
      out.push({ axis: row.key, min, max });
    }
    return out;
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
    if (event.key === 'Enter' && event.metaKey && this.canSubmit()) {
      event.preventDefault();
      this.submit();
    }
  }
}

/**
 * Parse to a positive integer. Accepts both `string` (typical signal
 * draft) and `number` — Angular's `ngModel` on `<input type="number">`
 * emits the parsed number when the browser parses it successfully, so
 * the signal's actual runtime type can be either. We coerce through
 * `String()` so the downstream parser always sees a trimmable value.
 */
function parsePositiveInt(raw: unknown): number {
  const str = raw === null || raw === undefined ? '' : String(raw);
  const parsed = Number.parseInt(str.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseRating(raw: unknown): number | undefined {
  const str = raw === null || raw === undefined ? '' : String(raw);
  const parsed = Number.parseFloat(str.trim());
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < 1 || parsed > 4) return undefined;
  return parsed;
}

function toDateInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Build a `number` timestamp (ms) from the date + time inputs, or
 *  null when either is empty. Time alone is meaningless without a
 *  date — we enforce date as the anchor. */
function parseDateTime(date: string, time: string): number | null {
  if (!date.trim()) return null;
  const hhmm = time.trim() || '00:00';
  const iso = `${date.trim()}T${hhmm}`;
  const parsed = new Date(iso);
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : null;
}
