import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'sh3-file-uploader',
  imports: [
    NgIf,
  ],
  templateUrl: './file-uploader.component.html',
  standalone: true,
  styleUrl: './file-uploader.component.scss',
})
export class FileUploaderComponent {
  @Input() label?: string;
  @Input() accept = '*/*';
  @Input() placeholder = 'Choose a file...';
  @Input() disabled = false;
  @Output() fileSelected = new EventEmitter<File>();

  fileName: string | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.fileName = file.name;
      this.fileSelected.emit(file);
    }
  }
}
