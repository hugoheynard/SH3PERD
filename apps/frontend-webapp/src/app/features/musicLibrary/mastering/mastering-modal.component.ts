import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/toast/toast.service';
import { MasteringApiService } from './mastering-api.service';
import { EqCurveComponent } from './eq-curve.component';
import {
  MASTERING_PRESETS,
  LUFS_TARGETS,
} from './mastering.types';
import type {
  TMasteringMode,
  TMasteringPreset,
  TMasteringModalContext,
  TMasteringResult,
} from './mastering.types';
import type { TMasteringTargetSpecs } from '@sh3pherd/shared-types';
import { IconComponent } from '../../../shared/icon/icon.component';

/**
 * Mastering modal — 3 modes, LUFS/TP/LRA targets, EQ visualisation.
 *
 * Opened from a track action button in the repertoire table or
 * reference card. The modal handles the full lifecycle:
 *
 * 1. Mode selection (standard / AI reference / AI auto)
 * 2. Target configuration (LUFS / TP / LRA with platform presets)
 * 3. Processing (loading state)
 * 4. Results display (EQ curve + compressor + before/after LUFS)
 */
@Component({
  selector: 'sh3-mastering-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EqCurveComponent, IconComponent],
  templateUrl: './mastering-modal.component.html',
  styleUrl: './mastering-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasteringModalComponent {
  private readonly api = inject(MasteringApiService);
  private readonly toast = inject(ToastService);

  readonly context = input.required<TMasteringModalContext>();
  readonly closed = output<TMasteringResult | null>();

  // ── Mode + options ─────────────────────────────────

  readonly mode = signal<TMasteringMode>('standard');
  readonly preset = signal<TMasteringPreset>('streaming');

  // LUFS targets with defaults
  readonly targetLUFS = signal(-14);
  readonly targetTP = signal(-1);
  readonly targetLRA = signal(7);

  // Reference track selection (AI mode)
  readonly referenceVersionId = signal<string | null>(null);
  readonly referenceTrackId = signal<string | null>(null);

  // ── Processing state ───────────────────────────────

  readonly processing = signal(false);
  readonly result = signal<TMasteringResult | null>(null);

  // ── Constants for template ─────────────────────────

  readonly presets = MASTERING_PRESETS;
  readonly lufsTargets = LUFS_TARGETS;

  // ── Derived ────────────────────────────────────────

  readonly isAiMode = computed(() => this.mode() === 'ai' || this.mode() === 'auto');
  readonly hasResult = computed(() => this.result() !== null);
  readonly eqParams = computed(() => this.result()?.predictedParams?.eq ?? null);
  readonly compressorParams = computed(() => this.result()?.predictedParams?.compressor ?? null);

  readonly beforeLUFS = computed(() => this.context().currentLUFS);
  readonly afterLUFS = computed(() =>
    this.result()?.track.analysisResult?.integratedLUFS ?? null,
  );

  readonly canSubmit = computed(() => {
    if (this.processing()) return false;
    if (this.mode() === 'ai') {
      // AI reference mode needs a reference track selected
      return this.referenceVersionId() !== null && this.referenceTrackId() !== null;
    }
    return true;
  });

  // ── Actions ────────────────────────────────────────

  selectMode(mode: TMasteringMode): void {
    this.mode.set(mode);
    this.result.set(null);
  }

  applyLufsPreset(lufs: number, tp: number): void {
    this.targetLUFS.set(lufs);
    this.targetTP.set(tp);
  }

  cancel(): void {
    if (this.processing()) return;
    this.closed.emit(null);
  }

  closeWithResult(): void {
    this.closed.emit(this.result());
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.processing.set(true);
    this.result.set(null);

    const ctx = this.context();
    const target: TMasteringTargetSpecs = {
      targetLUFS: this.targetLUFS(),
      targetTP: this.targetTP(),
      targetLRA: this.targetLRA(),
    };

    if (this.mode() === 'standard') {
      this.api.masterStandard(ctx.versionId, ctx.trackId, target).subscribe({
        next: (res) => {
          this.result.set(res);
          this.processing.set(false);
          this.toast.show('Track mastered', 'success');
        },
        error: () => this.processing.set(false),
      });
    } else {
      // AI or Auto mode
      this.api.masterAi(ctx.versionId, ctx.trackId, {
        mode: this.mode() === 'ai' ? 'reference' : 'auto',
        referenceVersionId: this.referenceVersionId() as any,
        referenceTrackId: this.referenceTrackId() as any,
        preset: this.mode() === 'auto' ? this.preset() : undefined,
        targetLUFS: target.targetLUFS,
        targetTP: target.targetTP,
        targetLRA: target.targetLRA,
      }).subscribe({
        next: (res) => {
          this.result.set(res);
          this.processing.set(false);
          this.toast.show('AI mastering complete', 'success');
        },
        error: () => this.processing.set(false),
      });
    }
  }

  // ── Compressor display helpers ─────────────────────

  formatRatio(ratio: number): string {
    return `${ratio.toFixed(1)}:1`;
  }

  formatMs(seconds: number): string {
    return `${(seconds * 1000).toFixed(0)} ms`;
  }

  formatDb(db: number): string {
    return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
  }

  lufsLabel(val: number | null | undefined): string {
    if (val == null) return '—';
    return `${val.toFixed(1)} LUFS`;
  }
}
