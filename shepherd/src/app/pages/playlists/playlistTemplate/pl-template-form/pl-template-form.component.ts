import {Component, inject} from '@angular/core';
import {PlaylistTemplateFormService} from '../../formsServices/playlist-template-form.service';
import {ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {PlTemplateService} from '../../../../services/pl-template.service';

@Component({
  selector: 'pl-template-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './pl-template-form.component.html',
  styleUrl: './pl-template-form.component.scss'
})
export class PlTemplateFormComponent {
   private playlistTemplateFormService: PlaylistTemplateFormService = inject(PlaylistTemplateFormService);
   private playlistTemplateService: PlTemplateService = inject(PlTemplateService);
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

   async postPlTemplate(input: { formData: any }): Promise<any> {
     return await this.playlistTemplateService.postPlTemplate({ formData: input.formData })
   };

  async updatePlTemplate(input: { formData: any }): Promise<any> {
    return await this.playlistTemplateService.updatePlTemplate({ formData: input.formData })
  };
}
