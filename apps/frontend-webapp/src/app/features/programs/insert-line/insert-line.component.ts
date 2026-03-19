import { Component, effect, HostBinding, inject, input, output, signal } from '@angular/core';
import { RadialMenuComponent } from '../radial-menu/radial-menu.component';
import { InsertLineService } from '../services/insert-line.service';


@Component({
  selector: 'ui-insert-line',
  standalone: true,
  templateUrl: './insert-line.component.html',
  styleUrl: './insert-line.component.scss',
  imports: [
    RadialMenuComponent,
  ],
})
export class InsertLineComponent {

  private insert = inject(InsertLineService);

  constructor() {
    effect(() => {
      if (!this.insert.altMode()) {
        this.menuOpen.set(false);
      }
    });
  }

  @HostBinding('style.top.px')
  get hostTop() {
    return this.top();
  };

  /**
   * Vertical position (px) inside the drop container.
   */
  top = input.required<number>();
  roomId = input<string>();

  showButton = input(false);

  add = output();

  onAdd() {
    this.add.emit();
  };

  radialItems = [
    { type: 'cue', label: 'Cue', angle: -90 },
    { type: 'buffer', label: 'Buf', angle: -30 },
    { type: 'slot', label: 'Slot', angle: 30 },
    { type: 'note', label: 'Note', angle: 90 },
  ];

  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  handleSelect(type: string) {
    this.menuOpen.set(false);
    console.log(type);

    // ici tu dispatch ton action (cue, buffer, etc.)
  }

}
