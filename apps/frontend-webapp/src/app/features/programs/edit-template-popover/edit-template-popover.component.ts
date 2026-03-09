import { Component, inject} from '@angular/core';
import { PopoverFrameComponent } from '../popover-frame/popover-frame.component';
import { ButtonComponent } from '../button/button.component';
import { PANEL_DATA } from '../../../core/main-layout/main-layout.component';
import type { PerformanceTemplate } from '../services/program-state.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

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
    template?: PerformanceTemplate;
  }>(PANEL_DATA);

  private fb = inject(FormBuilder);



  close(): void {}

  public mode = this.config.mode;
  public template: PerformanceTemplate | undefined = this.config.template;



  form = this.fb.group({
    title: [''],
    duration: [60],
    color: ['#06a4a4']
  });

  constructor() {
    if (this.mode === 'edit' && this.template) {
      this.form.patchValue({
        title: this.template.type,
        duration: this.template.duration,
        color: this.template.color
      });
    }
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
