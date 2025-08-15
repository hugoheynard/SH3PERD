import { Component, Input, TemplateRef } from '@angular/core';
import type { TUserMusicLibraryItem } from '@sh3pherd/shared-types';
import { RepertoireEntryComponent } from '../repertoire-entry/repertoire-entry.component';
import {
  ButtonIconComponent,
  ButtonSecondaryComponent,
  CheckboxComponent,
  SvgIconComponent,
  TagComponent,
} from '@sh3pherd/ui-angular';
import { MusicFileLineComponent } from '../music-file-line/music-file-line.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'music-card',
  imports: [
    CheckboxComponent,
    SvgIconComponent,
    ButtonSecondaryComponent,
    TagComponent,
    RepertoireEntryComponent,
    MusicFileLineComponent,
    ButtonIconComponent,
    NgIf,
  ],
  templateUrl: './music-card.component.html',
  standalone: true,
  styleUrl: './music-card.component.scss',
})
export class MusicCardComponent {
  @Input() item: TUserMusicLibraryItem  = {} as TUserMusicLibraryItem;
  protected readonly TemplateRef = TemplateRef;

  public fileContainerVisible: boolean = false;
  public statsVisible: boolean = false;

  /**
   * Toggle the visibility of the music files container.
   */
  toggleMusicFiles() {
    this.fileContainerVisible = !this.fileContainerVisible;
  };

  /**
   * Toggle the visibility of the statistics.
   */
  toggleStats(): void {
    this.statsVisible = !this.statsVisible;
  };

  editItem(): void {

  };

  deleteItem(): void {

  };

  canEdit(): boolean {
    return true;
  };
}
