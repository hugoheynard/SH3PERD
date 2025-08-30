import { Component, Input, output,  TemplateRef } from '@angular/core';
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


@Component({
  selector: 'music-card',
  imports: [
    CheckboxComponent,
    SvgIconComponent,
    ButtonSecondaryComponent,
    TagComponent,
    RepertoireEntryComponent,
    MusicFileLineComponent,
    ButtonIconComponent
],
  templateUrl: './music-card.component.html',
  standalone: true,
  styleUrl: './music-card.component.scss',
})
export class MusicCardComponent {
  @Input() item: TUserMusicLibraryItem  = {} as TUserMusicLibraryItem;
  public selected = output<TUserMusicLibraryItem>();
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

  /**
   * Check if the item can be edited.
   * @returns {boolean} True if the item can be edited, false otherwise.
   */
  canEdit(): boolean {
    return true;
  };

  /**
   * Check if the item can be deleted.
   * @returns {boolean} True if the item can be deleted, false otherwise.
   */
  canDelete(): boolean {
    return true;
  };
}
