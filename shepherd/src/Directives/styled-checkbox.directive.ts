import { Directive, ElementRef, Renderer2, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[StyledCheckbox]'
})
export class StyledCheckboxDirective implements OnInit {

  @Input() label: string = '';
  @Input() focusColor: string = '#007bff';
  @Input() errorColor: string = 'red';

  private labelElement!: HTMLElement;
  private wrapperElement!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2, private control: NgControl) {}

  ngOnInit(): void {
    this.createWrapper();
    this.applyBaseStyles();
    this.createLabel();

    if (this.control && this.control.control) {
      this.control.control.statusChanges?.subscribe(status => {
        if (status === 'INVALID') {
          this.setBorderColor(this.errorColor);
        } else {
          this.setBorderColor('transparent');
        }
      });
    }
  }

  private createWrapper(): void {
    this.wrapperElement = this.renderer.createElement('div');

    //wrapper style
    this.renderer.setStyle(this.wrapperElement, 'display', 'flex');
    this.renderer.setStyle(this.wrapperElement, 'justify-content', 'space-between');
    this.renderer.setStyle(this.wrapperElement, 'align-items', 'center');
    this.renderer.setStyle(this.wrapperElement, 'gap', '8px');
    this.renderer.setStyle(this.wrapperElement, 'width', '100%');
    this.renderer.setStyle(this.wrapperElement, 'margin-bottom', '10px');

    const parent = this.el.nativeElement.parentNode;
    this.renderer.insertBefore(parent, this.wrapperElement, this.el.nativeElement);
    this.renderer.appendChild(this.wrapperElement, this.el.nativeElement);
  }

  private applyBaseStyles(): void {
    this.renderer.setStyle(this.el.nativeElement, 'width', '16px');
    this.renderer.setStyle(this.el.nativeElement, 'height', '16px');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
    this.renderer.setStyle(this.el.nativeElement, 'accent-color', this.focusColor);
  }

  private createLabel(): void {
    if (!this.label) return;

    // Créer un élément <label>
    this.labelElement = this.renderer.createElement('label');
    const labelText = this.renderer.createText(this.label);
    this.renderer.appendChild(this.labelElement, labelText);

    // Générer un id unique pour l'input si nécessaire
    const inputId = this.el.nativeElement.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    this.renderer.setAttribute(this.el.nativeElement, 'id', inputId);
    this.renderer.setAttribute(this.labelElement, 'for', inputId);

    // Placer le label AVANT la checkbox
    const parent = this.el.nativeElement.parentNode;
    this.renderer.insertBefore(parent, this.labelElement, this.el.nativeElement);

    // Appliquer des styles au label pour s'assurer qu'il est visible
    this.renderer.setStyle(this.labelElement, 'display', 'block');
    this.renderer.setStyle(this.labelElement, 'font-size', '12px');
    this.renderer.setStyle(this.labelElement, 'font-weight', 'lighter');
    this.renderer.setStyle(this.labelElement, 'text-transform', 'uppercase');
    this.renderer.setStyle(this.labelElement, 'color', '#2e3031');
    this.renderer.setStyle(this.labelElement, 'margin-bottom', '3px');
  }

  private setBorderColor(color: string): void {
    this.renderer.setStyle(this.el.nativeElement, 'outline', `2px solid ${color}`);
  }

  @HostListener('focus') onFocus(): void {
    this.setBorderColor(this.focusColor);
  }

  @HostListener('blur') onBlur(): void {
    if (this.control && this.control.invalid) {
      this.setBorderColor(this.errorColor);
    } else {
      this.setBorderColor('transparent');
    }
  }
}
