import { Component } from '@angular/core';
import {FormBlockComponent} from '../../forms/musicTabConfigurator/components/form-block/form-block.component';
import {LabelWrapperDirective} from '../../../../../Directives/forms/label.directive';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-add-music-panel',
  imports: [
    FormBlockComponent,
    LabelWrapperDirective,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './add-music-panel.component.html',
  standalone: true,
  styleUrl: './add-music-panel.component.scss'
})
export class AddMusicPanelComponent {
  currentStep = 1;

  goToNextStep() {
    if (this.currentStep === 1 && this.musicFormGroup.valid) {
      this.currentStep++;
    }
  }

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Groupes de formulaire
  musicFormGroup: any = new FormGroup({
    title: new FormControl('', Validators.required),
    artist: new FormControl('', Validators.required)
  })

  versionFormGroup: any = new FormGroup({
    versionType: new FormControl('', Validators.required),
    genre: new FormControl('', Validators.required),
    versionName: new FormControl('', Validators.required)
  });

  submit() {
    if (this.versionFormGroup.valid) {
      const fullData = {
        ...this.musicFormGroup.value,
        ...this.versionFormGroup.value
      };
      // Appel API ici
      console.log('Submitting:', fullData);
    }
  }
}
