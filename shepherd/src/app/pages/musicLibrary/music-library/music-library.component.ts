import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatIconButton} from '@angular/material/button';
import {CdkAccordion, CdkAccordionItem} from '@angular/cdk/accordion';
import {VersionTableComponent} from '../versionTable/version-table/version-table.component';
import {FormsModule} from '@angular/forms';
import {ToggleButtonComponent} from '../../settingsModule/toggle-button/toggle-button.component';
import {AddSongFormComponent} from '../add-song-table/add-song-form.component';
import {MusicRepertoireService} from '../../../services/music-repertoire.service';
import {MusicTableComponent} from '../music-table/music-table.component';
import {MlDisplayService} from '../mlDisplayService';
import {SidenavRightService} from '../../../components/sidenav-right.service';
import {MusicRepertoireTableComponent} from '../music-repertoire-table/music-repertoire-table.component';
import {LayoutService} from '../../../../core/services/layout.service';

@Component({
    selector: 'app-music-library',
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
    AddSongFormComponent,
    MusicTableComponent,
    MusicRepertoireTableComponent
  ],
    templateUrl: './music-library.component.html',
    standalone: true,
    styleUrl: './music-library.component.scss'
})

export class MusicLibraryComponent {
  public musicRepertoireService: MusicRepertoireService = inject(MusicRepertoireService);
  public layoutService = inject(LayoutService);

  private sidenavRightService: SidenavRightService = inject(SidenavRightService);
  public addSongTableWindowService: MlDisplayService = inject(MlDisplayService);



  getUserMusicRepertoire(): void {

  };

}
