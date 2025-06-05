import {Directive, ElementRef, inject, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[DragStyle]',
  standalone: true
})
export class DragStyleDirective implements OnInit{
  private el:ElementRef = inject(ElementRef);
  private renderer: Renderer2 = inject(Renderer2);

  ngOnInit(): void {
    const element = this.el.nativeElement;

    // Ajout des classes de CDK Drag & Drop
    this.renderer.addClass(element, 'cdk-drag');
    this.renderer.addClass(element, 'cdk-drop-list');

    // Appliquer les styles globaux
    const styles = {
      cursor: 'grab',
      transition: 'transform 250ms cubic-bezier(0, 0, 0.2, 1)'
    };

    Object.entries(styles).forEach(([key, value]) => {
      this.renderer.setStyle(element, key, value);
    });

    // Gérer les classes dynamiques selon l’état du drag
    this.renderer.listen(element, 'mousedown', () => {
      this.renderer.addClass(element, 'cdk-drag-animating');
    });

    this.renderer.listen(element, 'mouseup', () => {
      this.renderer.removeClass(element, 'cdk-drag-animating');
    });
  }

}
