import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [],
  templateUrl: './file-management.component.html',
  styleUrl: './file-management.component.scss'
})
export class FileManagementComponent {
  @Input() i: number = 0;
  uploadedFiles: { [key: number]: File } = {}; // Stocker les fichiers uploadés par ligne
  expandedIndex: number | null = null;
  handleFileUpload(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFiles[index] = input.files[0];
      console.log(`File selected for version ${index}:`, this.uploadedFiles[index]);
    }
  };

  confirmFileUpload(index: number): void {
    if (this.uploadedFiles[index]) {
      console.log(`File confirmed for version ${index}:`, this.uploadedFiles[index]);
      //this.expandedIndex = null; // Masquer la ligne d'upload après confirmation
    } else {
      console.error('No file selected.');
    }
  };

  cancelFileUpload(): void {
    this.expandedIndex = null;
  };
}
