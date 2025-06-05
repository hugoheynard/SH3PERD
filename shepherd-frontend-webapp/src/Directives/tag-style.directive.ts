import {Directive, ElementRef, inject, Input, type OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[TagStyle]',
  standalone: true
})
export class TagStyleDirective implements OnInit {
  private el:ElementRef = inject(ElementRef);
  private renderer: Renderer2 = inject(Renderer2);
  private styles: any = {
    display: 'inline-block',
    height: '15px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'lowercase',
    backgroundColor: '#282a2a',
    borderRadius: '0.4rem',
    padding: '0.1rem 0.3rem',
    color: 'var(--culturedWhite)',
  };
  private tagBackground: { [key: string]: string } = {
    duo: '#c80bce',
    aerial: '#d9980b',
  };

  @Input() text: string = '';

  ngOnInit(): void {
    Object.entries(this.styles).forEach(([key, value]): void => {
      this.renderer.setStyle(this.el.nativeElement, key, value);
    });

    this.applyTagColor(this.text);

    if (this.text) {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', this.text);
    }
  };

  applyTagColor(tagName: string): void {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', this.tagBackground[tagName]);
  };
}

