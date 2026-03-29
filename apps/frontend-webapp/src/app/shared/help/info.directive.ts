import { Directive, inject, input, type OnDestroy, type OnInit } from '@angular/core';
import { HelpRegistryService, type HelpEntry } from './help-registry.service';

/**
 * Structural directive that registers a help entry when present in the DOM
 * and unregisters it on destroy (route change).
 *
 * Usage:
 * ```html
 * <div
 *   sh3Info="mastery-rating"
 *   sh3InfoLabel="Mastery"
 *   sh3InfoDesc="How well you know the piece (1–4)."
 *   sh3InfoGroup="music-library"
 * >
 *   ...
 * </div>
 * ```
 *
 * The entry auto-registers in the HelpRegistryService and is available
 * to the help right panel.
 */
@Directive({
  selector: '[sh3Info]',
  standalone: true,
})
export class InfoDirective implements OnInit, OnDestroy {

  private readonly helpRegistry = inject(HelpRegistryService);

  /** Unique identifier for this help entry. */
  readonly sh3Info = input.required<string>();

  /** Short label shown as title in the help panel. */
  readonly sh3InfoLabel = input.required<string>();

  /** Description / explanation shown in the help panel. */
  readonly sh3InfoDesc = input.required<string>();

  /** Optional group key for filtering (e.g. route or feature name). */
  readonly sh3InfoGroup = input<string>();

  ngOnInit(): void {
    const entry: HelpEntry = {
      id: this.sh3Info(),
      label: this.sh3InfoLabel(),
      description: this.sh3InfoDesc(),
      group: this.sh3InfoGroup(),
    };
    this.helpRegistry.register(entry);
  }

  ngOnDestroy(): void {
    this.helpRegistry.unregister(this.sh3Info());
  }
}
