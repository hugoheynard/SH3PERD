import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges
} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[label]'
})
export class LabelWrapperDirective implements OnInit, OnChanges {
  @Input('labelText') labelText: string = '';
  @Input() labelClass?: string | string[] | Set<string> | { [klass: string]: any };

  private label!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const inputEl = this.el.nativeElement;

    // Create label
    this.label = this.renderer.createElement('label');
    const text = this.renderer.createText(this.labelText);

    // Inject into DOM
    this.renderer.insertBefore(inputEl.parentNode, this.label, inputEl);
    this.renderer.removeChild(inputEl.parentNode, inputEl);
    this.renderer.appendChild(this.label, text);
    this.renderer.appendChild(this.label, inputEl);

    this.applyLabelClass();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['labelClass'] && this.label) {
      this.clearAllClasses(this.label);
      this.applyLabelClass();
    }
  }

  private applyLabelClass(): void {
    if (!this.labelClass || !this.label) return;

    if (typeof this.labelClass === 'string') {
      this.renderer.addClass(this.label, this.labelClass);
    } else if (Array.isArray(this.labelClass) || this.labelClass instanceof Set) {
      for (const cls of this.labelClass) {
        this.renderer.addClass(this.label, cls);
      }
    } else if (typeof this.labelClass === 'object') {
      for (const [cls, isActive] of Object.entries(this.labelClass)) {
        if (isActive) {
          this.renderer.addClass(this.label, cls);
        }
      }
    }
  }

  private clearAllClasses(el: HTMLElement): void {
    const classes = Array.from(el.classList);
    for (const cls of classes) {
      this.renderer.removeClass(el, cls);
    }
  }
};
