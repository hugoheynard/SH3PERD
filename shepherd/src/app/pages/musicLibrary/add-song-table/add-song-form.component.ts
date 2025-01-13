import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MusicLibraryService} from '../../../services/music-library.service';


@Component({
  selector: 'app-add-song-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './add-song-form.component.html',
  styleUrl: './add-song-form.component.scss'
})
export class AddSongFormComponent {
  private mlServ: any = inject(MusicLibraryService);

  song: { title: string; artist: string } = { title: '', artist: '' };

  onSubmit(form: any): void {
    console.log('Form submitted!', form.value);
    this.mlServ.addSong({ formData: form.value })
  };
}
