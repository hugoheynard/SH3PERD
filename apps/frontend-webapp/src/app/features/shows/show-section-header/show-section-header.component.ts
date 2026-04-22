import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { TShowId, TShowSectionViewModel } from '@sh3pherd/shared-types';
import { ButtonIconComponent } from '../../../shared/button-icon/button-icon.component';
import { IconComponent } from '../../../shared/icon/icon.component';
import { InlineConfirmComponent } from '../../../shared/inline-confirm/inline-confirm.component';
import { LayoutService } from '../../../core/services/layout.service';
import { SectionMutationService } from '../services/mutations-layer/section-mutation.service';
import {
  ConvertSectionPopoverComponent,
  type ConvertSectionPopoverData,
} from '../convert-section-popover/convert-section-popover.component';
import {
  SectionSettingsPopoverComponent,
  type SectionSettingsPopoverData,
} from '../section-settings-popover/section-settings-popover.component';

/**
 * Section header — drag handle, inline-editable name + description,
 * and the per-section actions (settings / mark-played / convert to
 * playlist / remove). Each header owns its own edit state; multiple
 * sections editing simultaneously is fine because focus can only sit
 * on one input at a time — blur commits.
 */
@Component({
  selector: 'app-show-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonIconComponent,
    IconComponent,
    InlineConfirmComponent,
  ],
  templateUrl: './show-section-header.component.html',
  styleUrl: './show-section-header.component.scss',
})
export class ShowSectionHeaderComponent {
  readonly showId = input.required<TShowId>();
  readonly section = input.required<TShowSectionViewModel>();
  /** `true` when the parent show has ≥ 2 sections — unlocks drag
   *  handle + remove button. */
  readonly multiSection = input(false);

  private readonly sectionMutations = inject(SectionMutationService);
  private readonly layout = inject(LayoutService);

  protected readonly editingName = signal(false);
  protected readonly nameDraft = signal('');
  protected readonly editingDesc = signal(false);
  protected readonly descDraft = signal('');

  // ── Rename ───────────────────────────────────────────

  startRename(): void {
    this.nameDraft.set(this.section().name);
    this.editingName.set(true);
  }

  commitRename(): void {
    const section = this.section();
    const name = this.nameDraft().trim();
    this.editingName.set(false);
    if (!name || name === section.name) return;
    this.sectionMutations.updateSection(this.showId(), section.id, { name });
  }

  cancelRename(): void {
    this.editingName.set(false);
  }

  onNameKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRename();
    }
  }

  // ── Description (inline) ─────────────────────────────

  startEditDesc(): void {
    this.descDraft.set(this.section().description ?? '');
    this.editingDesc.set(true);
  }

  commitEditDesc(): void {
    const section = this.section();
    const next = this.descDraft();
    const trimmed = next.trim();
    this.editingDesc.set(false);
    const current = section.description ?? '';
    if (trimmed === current.trim()) return;
    this.sectionMutations.updateSection(this.showId(), section.id, {
      description: trimmed.length ? next : '',
    });
  }

  cancelEditDesc(): void {
    this.editingDesc.set(false);
  }

  /** Enter commits, Shift+Enter inserts a newline, Escape cancels —
   *  same grammar as the show-level description editor. */
  onDescKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.commitEditDesc();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditDesc();
    }
  }

  // ── Actions ──────────────────────────────────────────

  openSettings(): void {
    this.layout.setPopover<
      SectionSettingsPopoverComponent,
      SectionSettingsPopoverData
    >(SectionSettingsPopoverComponent, {
      showId: this.showId(),
      sectionId: this.section().id,
    });
  }

  markPlayed(): void {
    this.sectionMutations.markSectionPlayed(this.showId(), this.section().id);
  }

  convertToPlaylist(): void {
    const section = this.section();
    this.layout.setPopover<
      ConvertSectionPopoverComponent,
      ConvertSectionPopoverData
    >(ConvertSectionPopoverComponent, {
      showId: this.showId(),
      sectionId: section.id,
      defaultName: `${section.name} — playlist`,
    });
  }

  remove(): void {
    if (!this.multiSection()) return;
    this.sectionMutations.removeSection(this.showId(), this.section().id);
  }
}
