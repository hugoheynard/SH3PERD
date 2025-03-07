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
      description: [template?.description || ''],
      usage: [template?.usage || 'daily'],
      requiredLength: [template?.requiredLength || 15],
      numberOfSongs: [template?.numberOfSongs || 4],
      intensity: [template?.intensity || 1],
      performers: this.createPerformerSubGroup(template.performers)
    });
  };

  createPerformerSubGroup(performers: any = {}): FormGroup {
    const performerGroup =  this.fb.group({
      singers: [performers.singers || false],
      singersConfig: this.createSingersConfigSubGroup(performers.singersConfig),
      musicians: [performers.musicians || false],
      musiciansConfig: this.fb.group({
        role: [performers.role || 'solo']
      }),

      aerial: [performers.aerial || false],
      aerialConfig: this.createAerialConfigSubGroup(performers.aerialConfig),
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

  createSingersConfigSubGroup(singersConfig: any = {}): FormGroup {
    const singersConfigGroup = this.fb.group({
      quantity: [singersConfig.quantity || 1],
      containsDuo: [singersConfig.containsDuo || false],
      splitMode: [singersConfig.splitMode || 'half_split'],
    });

    if (singersConfig.quantity <= 1) {
      singersConfig.get('containsDuo').disable();
    }

    return singersConfigGroup;
  };

  /**
   * Manages aerial performer configuration
   * @param aerialConfig
   */
  createAerialConfigSubGroup(aerialConfig: any = {}): FormGroup {
    return this.fb.group({
      performancePosition: [aerialConfig.performancePosition || 'end'],
    });
  };
}
