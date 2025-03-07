import {Component, inject, Input, OnInit} from '@angular/core';
import {AddSongFormComponent} from "../add-song-table/add-song-form.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {VersionTableComponent} from "../versionTable/version-table/version-table.component";
import {MusicLibraryService} from '../../../services/music-library.service';
import {MlDisplayService} from '../mlDisplayService';
import {AddVersionTableComponent} from '../versionTable/add-version-table/add-version-table.component';

@Component({
    selector: 'app-music-table',
    imports: [
        AddSongFormComponent,
        MatIcon,
        MatIconButton,
        NgForOf,
        NgIf,
        ReactiveFormsModule,
        VersionTableComponent,
        FormsModule,
        AddVersionTableComponent
    ],
    templateUrl: './music-table.component.html',
    standalone: true,
    styleUrl: './music-table.component.scss'
})
export class MusicTableComponent implements OnInit{
  public mlServ: any = inject(MusicLibraryService);
  public addSongTableWindowService: any = inject(MlDisplayService);

  public songs: any[] = [];
  public filteredSongs: any[] = [];
  public searchTerm: string = '';
  private artistAscending: boolean = false;
  private titleAscending: boolean = false;
  public expandedIndex: number | null = null;


  async ngOnInit(): Promise<void> {
    await this.refreshSongs();

  };

  async refreshSongs(): Promise<void> {
    this.songs = [...await this.mlServ.getMusic()];
    this.filteredSongs = [...this.songs];
    //TODO faire une websocket pour la modif de morceaux
  };

  filterSongs(): void {
    const lowerCaseTerm: string = this.searchTerm.toLowerCase();

    this.filteredSongs = this.songs.filter((song) => {
      return Object.values(song).some((value: string | any) =>
        typeof value === 'string' && value.toLowerCase().includes(lowerCaseTerm));
    });
  };

  openAddVersionWindow(): void {
    this.addSongTableWindowService.openAddVersionTr();
  };

  updateMusic(input: { music_id: string }): void {
    this.mlServ.updateMusic({ music_id: input.music_id });
  };

  deleteMusic(input: { music_id: string }): void {
    this.mlServ.deleteMusic({ music_id: input.music_id });
  };


  toggleAccordion(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  };

  sortByTitle(): void {
    this.filteredSongs.sort((a, b): number => {
      const artistA: string = a.title.toLowerCase();
      const artistB: string = b.title.toLowerCase();

      if (this.titleAscending) {
        return artistA < artistB ? -1 : artistA > artistB ? 1 : 0;
      }
      return artistA > artistB ? -1 : artistA < artistB ? 1 : 0;
    });
    this.titleAscending = !this.titleAscending;
  };

  sortByArtist(): void {
    this.filteredSongs.sort((a, b): number => {
      const artistA: string = a.artist.toLowerCase();
      const artistB: string = b.artist.toLowerCase();

      if (this.artistAscending) {
        return artistA < artistB ? -1 : artistA > artistB ? 1 : 0;
      }
      return artistA > artistB ? -1 : artistA < artistB ? 1 : 0;
    });
    this.artistAscending = !this.artistAscending;
  };

}
