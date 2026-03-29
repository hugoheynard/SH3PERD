import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/forms/input/input.component';
import { Genre, MUSIC_GENRES } from '../../music-library-types';
import type { AddVersionPayload } from '../../services/mutations-layer/music-library-mutation.service';
import type { MusicGenre, Rating } from '../../music-library-types';

@Component({
  selector: 'app-add-version-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  templateUrl: './add-version-form.component.html',
  styleUrl: './add-version-form.component.scss',
})
export class AddVersionFormComponent {

  readonly submitted = output<Omit<AddVersionPayload, 'entryId'>>();
  readonly cancelled = output<void>();

  readonly genres = MUSIC_GENRES;
  readonly ratingDots = [1, 2, 3, 4] as const;

  readonly label    = signal('');
  readonly genre    = signal<MusicGenre>(Genre.Pop);
  readonly mastery  = signal<Rating>(1);
  readonly energy   = signal<Rating>(1);
  readonly effort   = signal<Rating>(1);
  readonly duration = signal('');
  readonly bpm      = signal('');

  readonly rows: { key: 'mastery' | 'energy' | 'effort'; label: string }[] = [
    { key: 'mastery', label: 'MST' },
    { key: 'energy',  label: 'NRG' },
    { key: 'effort',  label: 'EFF' },
  ];

  readonly ratingSignals: Record<'mastery' | 'energy' | 'effort', ReturnType<typeof signal<Rating>>> = {
    mastery: this.mastery,
    energy:  this.energy,
    effort:  this.effort,
  };

  setRating(key: 'mastery' | 'energy' | 'effort', value: Rating): void {
    this.ratingSignals[key].set(value);
  }

  ratingLevel(r: Rating): string {
    return ['low', 'medium', 'high', 'max'][r - 1];
  }

  canSubmit(): boolean {
    return this.label().trim().length > 0;
  }

  submit(): void {
    if (!this.canSubmit()) return;
    const bpmRaw = parseInt(this.bpm(), 10);
    this.submitted.emit({
      label:   this.label().trim(),
      bpm:     isNaN(bpmRaw) ? undefined : bpmRaw,
      genre:   this.genre(),
      mastery: this.mastery(),
      energy:  this.energy(),
      effort:  this.effort(),
    });
    this.reset();
  }

  cancel(): void {
    this.reset();
    this.cancelled.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.submit();
    if (event.key === 'Escape') this.cancel();
  }

  private reset(): void {
    this.label.set('');
    this.genre.set(Genre.Pop);
    this.mastery.set(1);
    this.energy.set(1);
    this.effort.set(1);
    this.duration.set('');
    this.bpm.set('');
  }
}
