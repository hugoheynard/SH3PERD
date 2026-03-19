import { Component, computed, input, output } from '@angular/core';

type RadialItem = {
  type: string;
  label: string;
  angle: number;
};

type RadialItemComputed = RadialItem & {
  transform: string;
};

@Component({
  selector: 'ui-radial-menu',
  templateUrl: './radial-menu.component.html',
  styleUrl: './radial-menu.component.scss'
})
export class RadialMenuComponent {

  items = input.required<RadialItem[]>();
  select = output<string>();

  radius = 60;

  computedItems = computed<RadialItemComputed[]>(() => {
    return this.items().map(item => {

      const rad = (item.angle * Math.PI) / 180;

      const x = Math.cos(rad) * this.radius;
      const y = Math.sin(rad) * this.radius;

      return {
        ...item,
        transform: `translate(${x}px, ${y}px)`
      };
    });
  });

  onSelect(type: string) {
    this.select.emit(type);
  }
}
