import { Component } from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {CdkAccordion, CdkAccordionItem} from '@angular/cdk/accordion';
import {VersionTableComponent} from '../version-table/version-table.component';
import {FormsModule} from '@angular/forms';
import {ToggleButtonComponent} from '../../settingsModule/toggle-button/toggle-button.component';
import {AddSongFormComponent} from '../add-song-table/add-song-form.component';

@Component({
  selector: 'app-music-library',
  standalone: true,
  imports: [
    NgForOf,
    NgStyle,
    MatIcon,
    MatMenuTrigger,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    CdkAccordionItem,
    CdkAccordion,
    VersionTableComponent,
    NgIf,
    FormsModule,
    ToggleButtonComponent,
    AddSongFormComponent
  ],
  templateUrl: './music-library.component.html',
  styleUrl: './music-library.component.scss'
})

export class MusicLibraryComponent {
  public activeArtistList: any[] = ['A', 'B', 'C', 'D', 'E', 'F']
  public testList: any[] = [
    {
      title: 'show must go on',
      artist: 'Queen',
      availability: ['A', 'B'],
      versions: [
        {
          _id: 'ab2645hxkj1235',
          type: 'original',
          genre: 'rock',
          energy: 'slow',
          pitch: 2
        },
        {
          _id: 'ab2645hx123235',
          type: 'cover',
          genre: 'pop',
          energy: 'slow',
          pitch: 4
        },
        {
          _id: 'ab2645hx123235',
          type: 'cover',
          genre: 'pop',
          energy: 'slow',
          pitch: 4
        }]
    },
    {
      title: 'fire in the rain',
      artist: 'Adele'
    }
  ];
  public addSongTableVisible: boolean = true;

  private artistAscending: boolean = false;
  private titleAscending: boolean = false;

  expandedIndex: number | null = null;

  filteredSongs: any[] = [...this.testList];
  searchTerm: string = '';

  // Méthode pour filtrer les morceaux
  filterSongs(): void {
    const lowerCaseTerm: string = this.searchTerm.toLowerCase();

    this.filteredSongs = this.testList.filter((song) => {
      return Object.values(song).some((value: string | any) =>
        typeof value === 'string' && value.toLowerCase().includes(lowerCaseTerm));
    });
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
