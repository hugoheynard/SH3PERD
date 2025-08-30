import { Component } from '@angular/core';
import {FormBlockComponent} from '../../forms/musicTabConfigurator/components/form-block/form-block.component';
import {LabelWrapperDirective} from '../../../../../Directives/forms/label.directive';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { NgClass } from '@angular/common';
import {
  WizardContainerComponent
} from '../../../../shared/wizardContainer/wizard-container/wizard-container.component';
import {WizardStepComponent} from '../../../../shared/wizardContainer/wizard-step/wizard-step.component';
import { InputComponent, SelectComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'app-add-music-panel',
  imports: [
    FormBlockComponent,
    LabelWrapperDirective,
    ReactiveFormsModule,
    WizardContainerComponent,
    WizardStepComponent,
    NgClass,
    InputComponent,
    SelectComponent
],
  templateUrl: './add-music-panel.component.html',
  standalone: true,
  styleUrl: './add-music-panel.component.scss'
})
export class AddMusicPanelComponent {
  matchedTracks: any[] = [{id: 1, title: 'Somebody to love', artist: 'queen'}, {id: 2, title: 'Love in an elevator', artist: 'Aerosmith'}, {id: 3, title: 'Somebody to love', artist: 'queen'}, {id: 3, title: 'Somebody to love', artist: 'queen'}];
  selectedTrackId: string | null = null;

  selectTrack(track: any): void {
    this.selectedTrackId = track.id;
    console.log('Track selected:', track.id);
  }

  addNewTrack() {

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
