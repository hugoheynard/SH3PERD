import {Component, inject, type OnInit} from '@angular/core';
import {PlTemplateService} from '../../playlistService/pl-template.service';
import {NgForOf} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {PlaylistService} from '../../playlistService/playlist.service';

@Component({
  selector: 'pl-template-table',
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './pl-template-table.component.html',
  standalone: true,
  styleUrl: './pl-template-table.component.scss'
})
export class PlTemplateTableComponent implements OnInit {
  private pltServ: PlTemplateService = inject(PlTemplateService);
  private playlistService: PlaylistService = inject(PlaylistService);
  public plTemplates: any = [];
  public filteredPlTemplates: any = [];

  async ngOnInit(): Promise<void> {
     const result = await this.pltServ.getPlTemplates();
    this.plTemplates = result.body.playlistTemplates
    this.filteredPlTemplates = this.plTemplates;
  };

  /**
   * Filter the table based on the input value
   * @param event
   * @param column
   */
  filterTable(event: Event, column: string): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPlTemplates = this.plTemplates.filter((template: any) =>
      template[column].toString().toLowerCase().includes(filterValue)
    );
  };

  /**
   * if a playlist template is selected, create a new blank playlist from the template settings
   * @param input
   */
  async createPlaylistFromTemplate(input: { playlistTemplate_id: string }): Promise<any> {
    console.log('1-button works')
    const { playlistTemplate_id } = input;
    console.log('2- I get playlistTemplate_id:', input.playlistTemplate_id);
    /*
    if (!playlistTemplate_id) {
      return;
    }

     */

    await this.playlistService.createNewEmptyPlaylistFromTemplate({ playlistTemplate_id: playlistTemplate_id });
    return;
  };

  editPlaylistTemplate(_template: any): void {};
  deletePlaylistTemplate(_template: any): void {};

}
