import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { DragLayerComponent } from '../drag-and-drop/drag-layer/drag-layer.component';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    DragLayerComponent,
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent{}
