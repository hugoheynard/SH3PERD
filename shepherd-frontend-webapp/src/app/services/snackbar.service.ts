import {inject, Injectable} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackBar: MatSnackBar = inject(MatSnackBar);

  show(message: string, action: string = 'Close', duration: number = 3000, horizontalPosition: 'start' | 'center' | 'end' | 'left' | 'right' = 'center', verticalPosition: 'top' | 'bottom' = 'bottom') {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition,
      verticalPosition,
    });
  }
}
