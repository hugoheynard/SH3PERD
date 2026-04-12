import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Confirmation mode:
 *
 * - `toggle`       — click trigger → "Confirm?" + "×" → click confirm → emit
 * - `inline`       — click trigger → "Remove" + "Cancel" side by side → click → emit
 * - `danger-zone`  — click trigger → warning message + "Yes, delete" + "Cancel" → emit
 * - `type-confirm` — click trigger → warning → text input must match `matchValue` → emit
 */
export type TInlineConfirmMode = 'toggle' | 'inline' | 'danger-zone' | 'type-confirm';

/**
 * Multi-step internal state for modes that need more than two phases.
 * - `idle`     — trigger content visible, no confirmation in progress
 * - `confirm`  — first confirmation step (warning / buttons visible)
 * - `input`    — type-confirm mode: text input visible, waiting for match
 */
type TConfirmStep = 'idle' | 'confirm' | 'input';

/**
 * Shared inline confirm component.
 *
 * Replaces 4 ad-hoc confirmation patterns scattered across the codebase
 * with a single, configurable component that handles the UX state
 * machine internally and only emits `confirmed` / `cancelled` outputs.
 *
 * ## Content projection
 *
 * The default `<ng-content>` slot is the **trigger** — whatever the
 * host puts between the tags is shown in the `idle` state and hidden
 * once the confirmation flow starts. This lets each call site keep its
 * own trigger styling (trash icon, "Delete" button, etc.) while the
 * confirm UI is standardised.
 *
 * ```html
 * <sh3-inline-confirm mode="toggle" (confirmed)="delete()">
 *   <button class="my-trigger">🗑</button>
 * </sh3-inline-confirm>
 * ```
 *
 * For modes that provide their own trigger (`danger-zone`, `type-confirm`),
 * the projected content is ignored and the component renders
 * `triggerLabel` as a full-width button.
 *
 * ## Usage examples
 *
 * ```html
 * <!-- Toggle (music table delete) -->
 * <sh3-inline-confirm mode="toggle" (confirmed)="onDelete()">
 *   <button class="btn-delete">🗑</button>
 * </sh3-inline-confirm>
 *
 * <!-- Inline (member remove) -->
 * <sh3-inline-confirm mode="inline" confirmLabel="Remove" (confirmed)="onRemove()">
 *   <button class="btn-remove">×</button>
 * </sh3-inline-confirm>
 *
 * <!-- Danger zone (delete company) -->
 * <sh3-inline-confirm
 *   mode="danger-zone"
 *   triggerLabel="Delete company"
 *   warningText="This action is irreversible. All data will be lost."
 *   confirmLabel="Yes, delete permanently"
 *   (confirmed)="onDeleteCompany()"
 * />
 *
 * <!-- Type confirm (archive node) -->
 * <sh3-inline-confirm
 *   mode="type-confirm"
 *   triggerLabel="Delete this node"
 *   warningText="Type the node name to confirm:"
 *   [matchValue]="nodeName"
 *   confirmLabel="Confirm delete"
 *   (confirmed)="onArchive()"
 * />
 * ```
 */
@Component({
  selector: 'sh3-inline-confirm',
  standalone: true,
  templateUrl: './inline-confirm.component.html',
  styleUrl: './inline-confirm.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineConfirmComponent {

  // ── Inputs ─────────────────────────────────────────────

  /** Confirmation UX pattern. Default: `toggle`. */
  readonly mode = input<TInlineConfirmMode>('toggle');

  /** Label for the confirm action button. */
  readonly confirmLabel = input('Confirm?');

  /** Label for the cancel action. */
  readonly cancelLabel = input('Cancel');

  /**
   * Label for the built-in trigger button (used by `danger-zone` and
   * `type-confirm` modes which render their own trigger instead of
   * relying on projected content).
   */
  readonly triggerLabel = input('Delete');

  /** Warning message shown during the confirmation step. */
  readonly warningText = input<string | null>(null);

  /**
   * Value the user must type to confirm (`type-confirm` mode only).
   * Matching is case-insensitive + trimmed.
   */
  readonly matchValue = input('');

  /** Text shown in the input placeholder (`type-confirm` mode). */
  readonly matchPlaceholder = input<string | null>(null);

  /** Whether the action is currently running (shows a loading state). */
  readonly loading = input(false);

  /** Size variant: `sm` for tight inline rows, `md` for standalone blocks. */
  readonly size = input<'sm' | 'md'>('sm');

  // ── Outputs ────────────────────────────────────────────

  /** Emitted when the user completes the full confirmation flow. */
  readonly confirmed = output<void>();

  /** Emitted when the user cancels at any step. */
  readonly cancelled = output<void>();

  // ── Internal state ─────────────────────────────────────

  readonly step = signal<TConfirmStep>('idle');
  readonly typedValue = signal('');

  /** Whether the typed value matches (type-confirm mode). */
  readonly inputMatches = computed(() => {
    const match = this.matchValue().trim().toLowerCase();
    const typed = this.typedValue().trim().toLowerCase();
    return match.length > 0 && typed === match;
  });

  /** True when the trigger (projected content or built-in button) should show. */
  readonly showTrigger = computed(() => this.step() === 'idle');

  /** True when toggle/inline confirm buttons should show. */
  readonly showConfirmButtons = computed(() => this.step() === 'confirm');

  /** True when the type-to-confirm input should show. */
  readonly showInput = computed(() => this.step() === 'input');

  /**
   * Modes that use projected content as trigger vs. built-in button.
   * `toggle` and `inline` use `<ng-content>` (the host provides the
   * trigger). `danger-zone` and `type-confirm` render their own
   * styled trigger from `triggerLabel`.
   */
  readonly usesProjectedTrigger = computed(() => {
    const m = this.mode();
    return m === 'toggle' || m === 'inline';
  });

  // ── Actions ────────────────────────────────────────────

  /** Start the confirmation flow. Called by the trigger (click). */
  activate(): void {
    const m = this.mode();
    if (m === 'type-confirm') {
      // type-confirm goes: idle → confirm (warning) → input
      this.step.set('confirm');
    } else {
      this.step.set('confirm');
    }
  }

  /**
   * Proceed to the text-input step (type-confirm mode).
   * Called from the warning step's "Yes" button.
   */
  proceedToInput(): void {
    this.typedValue.set('');
    this.step.set('input');
  }

  /** Complete the confirmation. */
  confirm(): void {
    if (this.mode() === 'type-confirm' && !this.inputMatches()) return;
    this.step.set('idle');
    this.typedValue.set('');
    this.confirmed.emit();
  }

  /** Cancel and return to idle. */
  cancel(): void {
    this.step.set('idle');
    this.typedValue.set('');
    this.cancelled.emit();
  }

  /** Text input handler (type-confirm mode). */
  onInput(event: Event): void {
    this.typedValue.set((event.target as HTMLInputElement).value);
  }

  /** Keyboard handler for the text input. */
  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.confirm();
    if (event.key === 'Escape') this.cancel();
  }
}
