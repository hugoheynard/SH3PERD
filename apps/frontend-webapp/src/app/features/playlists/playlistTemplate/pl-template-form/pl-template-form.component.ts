import {Component, inject} from '@angular/core';
import {PlaylistTemplateFormService} from '../../formsServices/playlist-template-form.service';
import {ReactiveFormsModule} from '@angular/forms';

import {PlTemplateService} from '../../playlistService/pl-template.service';
import { ToastService } from '../../../../shared/toast/toast.service';

@Component({
  selector: 'pl-template-form',
  imports: [
    ReactiveFormsModule
],
  templateUrl: './pl-template-form.component.html',
  standalone: true,
  styleUrl: './pl-template-form.component.scss'
})
export class PlTemplateFormComponent {
   private playlistTemplateFormService: PlaylistTemplateFormService = inject(PlaylistTemplateFormService);
   private playlistTemplateService: PlTemplateService = inject(PlTemplateService);
   private readonly toast = inject(ToastService);
   public templateForm = this.playlistTemplateFormService.createTemplateFormGroup();
   public editMode: boolean = false;

   singerActive(): boolean {
      return this.templateForm.get('performers.singers')?.value;
   };

   moreThanOneSinger(): boolean {
     return this.templateForm.get('performers.singersConfig.quantity')?.value > 1;
   };

   musicianActive(): boolean {
     return this.templateForm.get('performers.musicians')?.value;
   };

   aerialActive(): boolean {
     return this.templateForm.get('performers.aerial')?.value;
   };

   async getPlTemplates(): Promise<any> {
     return await this.playlistTemplateService.getPlTemplates();
   };

  async postPlTemplate(input: { formData: any }): Promise<any> {
    const result = await this.playlistTemplateService.postPlTemplate({ formData: input.formData });

    if (result.status !== 201) {
      this.toast.show('Failed to create template');
      return result;
    }
    this.toast.show('Template created successfully');
    return result;
  };

   async updatePlTemplate(input: { formData: any }): Promise<any> {
    const result = await this.playlistTemplateService.updatePlTemplate({ formData: input.formData });

     if (result.status !== 204) {
       this.toast.show('Failed to update template');
       return result;
     }
     this.toast.show('Template updated successfully');
     return result;
   };
}
