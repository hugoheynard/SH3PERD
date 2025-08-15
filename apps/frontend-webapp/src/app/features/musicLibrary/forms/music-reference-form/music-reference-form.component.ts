import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonPrimaryComponent, InputComponent,
} from '@sh3pherd/ui-angular';
import { FormBlockComponent } from '../musicTabConfigurator/components/form-block/form-block.component';
import { MusicReferenceService } from '../../services/music-reference.service';
import type { TMusicReferenceDomainModel } from '@sh3pherd/shared-types';

@Component({
  selector: 'app-music-reference-form',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule,
    ButtonPrimaryComponent,
    FormBlockComponent,
  ],
  templateUrl: './music-reference-form.component.html',
  standalone: true,
  styleUrl: './music-reference-form.component.scss',
})
export class MusicReferenceFormComponent {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private musRefService: MusicReferenceService = inject(MusicReferenceService);
  public form: FormGroup = this.createForm();
  @Output() created = new EventEmitter<TMusicReferenceDomainModel>();

  createForm(): FormGroup {
    return this.fb.group({
      title: this.fb.control<string>('', { updateOn: 'blur' }),
      artist: this.fb.control<string>('', { updateOn: 'blur' }),
    });
  };

  async onSubmit(): Promise<void>{
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = await this.musRefService.createOne(this.form.value);

    if (!result) {
      return;
    }
    this.created.emit(result);
    return;
  };
}
