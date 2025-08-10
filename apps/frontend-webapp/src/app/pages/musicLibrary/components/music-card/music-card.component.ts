import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { TUserMusicLibraryItem } from '@sh3pherd/shared-types';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { RepertoireEntryComponent } from '../repertoire-entry/repertoire-entry.component';
import { ButtonSecondaryComponent, CheckboxComponent, SvgIconComponent, TagComponent } from '@sh3pherd/ui-angular';

@Component({
  selector: 'music-card',
  imports: [
    CheckboxComponent,
    SvgIconComponent,
    ButtonSecondaryComponent,
    TagComponent,
    RepertoireEntryComponent,
  ],
  templateUrl: './music-card.component.html',
  standalone: true,
  styleUrl: './music-card.component.scss',
})
export class MusicCardComponent {
  @Input() item: TUserMusicLibraryItem  = {} as TUserMusicLibraryItem;
  protected readonly TemplateRef = TemplateRef;
}
