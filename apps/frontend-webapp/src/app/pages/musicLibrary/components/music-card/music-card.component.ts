import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TUserMusicLibraryItem } from '@sh3pherd/shared-types';
import { NgIf } from '@angular/common';
import { ButtonSecondaryComponent, CheckboxComponent, SvgIconComponent, TagComponent } from '@sh3pherd/ui-angular';
import { MatIcon } from '@angular/material/icon';
import { RepertoireEntryComponent } from '../repertoire-entry/repertoire-entry.component';

@Component({
  selector: 'music-card',
  imports: [
    NgIf,
    CheckboxComponent,
    MatIcon,
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
  @Input() item: TUserMusicLibraryItem = {} as TUserMusicLibraryItem;
}
