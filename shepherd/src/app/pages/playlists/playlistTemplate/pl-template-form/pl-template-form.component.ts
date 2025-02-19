import {Component, inject} from '@angular/core';
import {PlaylistTemplateFormService} from '../../formsServices/playlist-template-form.service';
import {ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

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

   public templateForm = this.playlistTemplateFormService.createTemplateFormGroup();
}
