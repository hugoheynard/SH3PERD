import {Component, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-wizard-step',
  imports: [],
  templateUrl: './wizard-step.component.html',
  standalone: true,
  styleUrl: './wizard-step.component.scss'
})
export class WizardStepComponent {
  @ViewChild('stepTemplate', { static: true }) templateRef!: TemplateRef<any>;

}
