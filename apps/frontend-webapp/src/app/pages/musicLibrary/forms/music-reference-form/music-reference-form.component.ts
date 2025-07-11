import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonPrimaryComponent, ButtonSecondaryComponent,
  ButtonTertiaryComponent,
  CheckboxComponent,
  InputComponent,
} from '@sh3pherd/ui-angular';
import { NgStyle } from '@angular/common';
import { FormBlockComponent } from '../musicTabConfigurator/components/form-block/form-block.component';
import { MusicReferenceService } from '../../services/music-reference.service';

@Component({
  selector: 'app-music-reference-form',
  imports: [
    FormsModule,
    InputComponent,
    ReactiveFormsModule,
    ButtonTertiaryComponent,
    CheckboxComponent,
    NgStyle,
    ButtonPrimaryComponent,
    FormBlockComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './music-reference-form.component.html',
  standalone: true,
  styleUrl: './music-reference-form.component.scss',
})
export class MusicReferenceFormComponent {
  private fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private musRefService: MusicReferenceService = inject(MusicReferenceService);
  public form: FormGroup = this.createForm();

  createForm(): FormGroup {
    return this.fb.group({
      title: this.fb.control<string>('', { updateOn: 'blur' }),
      artist: this.fb.control<string>('', { updateOn: 'blur' }),
    });
  };

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.musRefService.createOne(this.form.value);
    return;
  };
}
