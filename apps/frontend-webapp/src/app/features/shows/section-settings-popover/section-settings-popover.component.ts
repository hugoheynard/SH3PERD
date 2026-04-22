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
  TShowAxisCriterion,
  TShowAxisKey,
  TShowId,
  TShowSectionId,
} from '@sh3pherd/shared-types';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { LayoutService } from '../../../core/services/layout.service';
import { PopoverFrameComponent } from '../../../shared/ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../../../shared/button/button.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { ShowsStateService } from '../services/shows-state.service';
import { ShowsMutationService } from '../services/shows-mutation.service';

export interface SectionSettingsPopoverData {
  showId: TShowId;
  sectionId: TShowSectionId;
}

type TargetMode = 'none' | 'duration' | 'track_count';

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
 * Edit every section-level setting in one panel — mirror of
 * `ShowSettingsPopoverComponent` scoped to a single section.
 *
 * Colour isn't exposed: sections inherit their visual identity from
 * the parent show. Everything else (name, description, target mode,
 * startAt, axis criteria) matches the show-level popover so the two
 * layers read with a coherent grammar.
 */
@Component({
  selector: 'app-section-settings-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PopoverFrameComponent, ButtonComponent, IconComponent],
  templateUrl: './section-settings-popover.component.html',
  styleUrl: './section-settings-popover.component.scss',
})
export class SectionSettingsPopoverComponent implements OnInit {
  private readonly data = inject(INJECTION_DATA) as SectionSettingsPopoverData;
  private readonly state = inject(ShowsStateService);
  private readonly mutations = inject(ShowsMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly axisRows = AXIS_ROWS;

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly targetMode = signal<TargetMode>('none');
  protected readonly targetDurationMinutes = signal('30');
  protected readonly targetTrackCount = signal('6');
  protected readonly startAtDate = signal('');
  protected readonly startAtTime = signal('');
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
    const section = show.sections.find((s) => s.id === this.data.sectionId);
    if (!section) return;

    this.name.set(section.name);
    this.description.set(section.description ?? '');

    if (section.target?.mode === 'duration') {
      this.targetMode.set('duration');
      this.targetDurationMinutes.set(
        String(Math.round(section.target.duration_s / 60)),
      );
    } else if (section.target?.mode === 'track_count') {
      this.targetMode.set('track_count');
      this.targetTrackCount.set(String(section.target.track_count));
    } else {
      this.targetMode.set('none');
    }

    if (section.startAt) {
      const d = new Date(section.startAt);
      this.startAtDate.set(toDateInput(d));
      this.startAtTime.set(toTimeInput(d));
    }

    const draft = { ...this.axes() };
    for (const c of section.axisCriteria ?? []) {
      draft[c.axis] = {
        enabled: true,
        min: c.min !== undefined ? String(c.min) : '1',
        max: c.max !== undefined ? String(c.max) : '4',
      };
    }
    this.axes.set(draft);
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

    // Target: section target is a discriminated union on the backend
    // (`mode: 'duration' | 'track_count'`). We emit one of:
    //   - the chosen shape (duration | track_count)
    //   - `null` to clear
    const mode = this.targetMode();
    let target:
      | { mode: 'duration'; duration_s: number }
      | { mode: 'track_count'; track_count: number }
      | null = null;
    if (mode === 'duration') {
      const minutes = parsePositiveInt(this.targetDurationMinutes());
      if (minutes > 0) {
        target = { mode: 'duration', duration_s: minutes * 60 };
      }
    } else if (mode === 'track_count') {
      const count = parsePositiveInt(this.targetTrackCount());
      if (count > 0) {
        target = { mode: 'track_count', track_count: count };
      }
    }

    const startAt = parseDateTime(this.startAtDate(), this.startAtTime());
    const criteria = this.buildCriteria();

    this.mutations.updateSection(this.data.showId, this.data.sectionId, {
      name,
      description,
      target,
      startAt: startAt ?? null,
      axisCriteria: criteria,
    });
    this.close();
  }

  private buildCriteria(): TShowAxisCriterion[] {
    const out: TShowAxisCriterion[] = [];
    const axes = this.axes();
    for (const row of AXIS_ROWS) {
      const draft = axes[row.key];
      if (!draft.enabled) continue;
      const min = parseRating(draft.min);
      const max = parseRating(draft.max);
      if (min === undefined && max === undefined) continue;
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

function parsePositiveInt(raw: string): number {
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseRating(raw: string): number | undefined {
  const parsed = Number.parseFloat(raw.trim());
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

function parseDateTime(date: string, time: string): number | null {
  if (!date.trim()) return null;
  const hhmm = time.trim() || '00:00';
  const iso = `${date.trim()}T${hhmm}`;
  const parsed = new Date(iso);
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : null;
}
