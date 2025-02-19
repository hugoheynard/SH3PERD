import {inject, Injectable} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PlaylistTemplateFormService {
  private fb: FormBuilder = inject(FormBuilder);
  private templateForm!: FormGroup;

  getForm(): FormGroup {
    return this.templateForm;
  };

  createTemplateFormGroup(template: any = {}): FormGroup {
    return this.fb.group({
      name: [template?.name || 'New playlist template'],
      usage: [template?.usage || 'Daily'],
      requiredLength: [template?.requiredLength || 15],
      numberOfSongs: [template?.numberOfSongs || 4],
      performers: this.createPerformerSubGroup(template.performers)
    });
  };

  createPerformerSubGroup(performers: any = {}): FormGroup {
    const performerGroup =  this.fb.group({
      singers: [performers.singers || false],
      singersConfig: this.fb.group({
        multiples: [performers.multiples || false],
        numberOfSingers: [{
          value: performers.numberOfSingers || 2,
          disabled: !performers.multiples
        }],
        containsDuo: [performers.containsDuo || false],
        splitMode: [performers.splitMode || 'half split'],
      }),
      musicians: [performers.musicians || false],
      musiciansConfig: this.fb.group({
        role: [performers.role || 'solo']
      }),

      aerial: [performers.musicians || false],
      aerialPosition: [{
        value: performers.aerialPosition || 'end',
        disabled: !performers.containsAerial
      }],
    });

    if (!performers.singers) {
      performerGroup.get('singersConfig')?.disable();
    }

    performerGroup.get('singers')?.valueChanges.subscribe(value => {
      if (value) {
        performerGroup.get('singersConfig')?.enable();
      } else {
        performerGroup.get('singersConfig')?.disable();
      }
    });

    return performerGroup;
  };




}
