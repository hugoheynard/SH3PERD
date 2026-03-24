import { Directive, ElementRef, inject, type OnInit } from '@angular/core';

/**
* Marks an element as selectable within the UI selection system.
*
* Adds a `data-selectable` attribute to the host element,
* allowing global click handlers to detect selection boundaries.
*/
@Directive({
  selector: '[uiSelectable]',
  standalone: true
})
export class SelectableDirective implements OnInit {

  private el = inject(ElementRef<HTMLElement>);

  ngOnInit() {
    this.el.nativeElement.setAttribute('data-selectable', '');
  }
}
