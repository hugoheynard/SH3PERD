import {Component, ContentChildren, ElementRef, EventEmitter, Input, Output, QueryList} from '@angular/core';
import {WizardStepComponent} from '../wizard-step/wizard-step.component';
import {NgForOf, NgIf, NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-wizard-container',
  imports: [
    NgTemplateOutlet,
    NgIf,
    NgForOf
  ],
  templateUrl: './wizard-container.component.html',
  standalone: true,
  styleUrl: './wizard-container.component.scss'
})
export class WizardContainerComponent {
  @Input() dotNavigation: boolean = false;
  @ContentChildren(WizardStepComponent) steps!: QueryList<WizardStepComponent>;


  currentStep = 0;

  get maxStep(): number {
    return this.steps.length - 1;
  }

  ngAfterContentInit(): void {
    // Vérification ou logique additionnelle si nécessaire
  }

  nextStep(): void {
    if (this.currentStep < this.maxStep) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index <= this.maxStep) {
      this.currentStep = index;
    }
  };
}
