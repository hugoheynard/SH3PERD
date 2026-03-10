import { Component, inject} from '@angular/core';
import { PopoverFrameComponent } from '../ui-frames/popover-frame/popover-frame.component';
import { ButtonComponent } from '../button/button.component';
import { INJECTION_DATA } from '../../../core/main-layout/main-layout.component';
import { type AbstractControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import type { ArtistPerformanceSlotTemplate } from '../program-types';

@Component({
  selector: 'app-edit-template-popover',
  imports: [
    PopoverFrameComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-template-popover.component.html',
  styleUrl: './edit-template-popover.component.scss'
})
export class EditTemplatePopoverComponent {

  private config = inject<{
    mode: 'edit' | 'create';
    template?: ArtistPerformanceSlotTemplate;
  }>(INJECTION_DATA);

  private fb = inject(NonNullableFormBuilder);



  close(): void {}

  public mode = this.config.mode;
  public template: ArtistPerformanceSlotTemplate | undefined = this.config.template;



  form = this.fb.group(
    {
      title: '',
      duration: 60,
      color: '#06a4a4',

      playlist: false,
      singleTrack: false,

      technicianRequired: false
    },
    { validators: this.musicValidator }
  );

  musicValidator(group: AbstractControl) {

    const playlist = group.get('playlist')?.value;
    const singleTrack = group.get('singleTrack')?.value;

    if (playlist && singleTrack) {
      return { musicConflict: true };
    }

    return null;

  }

  constructor() {
    if (this.mode === 'edit' && this.template) {
      this.form.patchValue({
        title: this.template.type,
        duration: this.template.duration,
        color: this.template.color
      });
    }

    this.form.get('playlist')?.valueChanges.subscribe(v => {
      if (v) {
        this.form.get('singleTrack')?.setValue(false, { emitEvent: false });
      }
    });

    this.form.get('singleTrack')?.valueChanges.subscribe(v => {
      if (v) {
        this.form.get('playlist')?.setValue(false, { emitEvent: false });
      }
    });
  }

  submit() {
    const value = this.form.value;

    if (this.mode === 'create') {
      // create template
      console.log('Creating template with values:', value);
    }

    if (this.mode === 'edit') {
      // update template
      console.log('Updating template with values:', value);
    }
  }
}
