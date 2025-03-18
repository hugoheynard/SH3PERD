import { Directive, ElementRef, Renderer2, HostListener, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[StyledInput]'
})
export class StyledInputDirective implements OnInit {

  @Input() label!: string;
  @Input() focusColor: string = '#007bff';
  @Input() errorColor: string = 'red';

  private labelElement!: HTMLElement;
  private wrapperElement!: HTMLElement;
  private isSelect!: boolean;  // Détecter si c'est un <select>

  constructor(private el: ElementRef, private renderer: Renderer2, private control: NgControl) {}

  ngOnInit(): void {
    this.isSelect = this.el.nativeElement.tagName.toLowerCase() === 'select'; // Vérifie si c'est un <select>
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
    this.renderer.setStyle(this.wrapperElement, 'display', 'flex');
    this.renderer.setStyle(this.wrapperElement, 'flex-direction', 'column');
    //this.renderer.setStyle(this.wrapperElement, 'width', '100%');
    this.renderer.setStyle(this.wrapperElement, 'margin-bottom', '10px');

    const parent = this.el.nativeElement.parentNode;
    this.renderer.insertBefore(parent, this.wrapperElement, this.el.nativeElement);
    this.renderer.appendChild(this.wrapperElement, this.el.nativeElement);
  }

  private applyBaseStyles(): void {
    if (this.isSelect) {
      // Styles spécifiques au select
      this.renderer.setStyle(this.el.nativeElement, 'appearance', 'none'); // Supprime le style natif
      this.renderer.setStyle(this.el.nativeElement, '-webkit-appearance', 'none');
      this.renderer.setStyle(this.el.nativeElement, '-moz-appearance', 'none');
      this.renderer.setStyle(this.el.nativeElement, 'background-color', 'white');
      this.renderer.setStyle(this.el.nativeElement, 'height', '2.2rem'); // Hauteur spécifique au select
      this.renderer.setStyle(this.el.nativeElement, 'padding', '0.5rem');
      this.renderer.setStyle(this.el.nativeElement, 'border-radius', '0.35rem');
    } else {
      // Styles généraux pour les inputs
      this.renderer.setStyle(this.el.nativeElement, 'height', '1.2rem');
      this.renderer.setStyle(this.el.nativeElement, 'padding', '8px');
    }

    // Styles communs à tous les champs
    this.renderer.setStyle(this.el.nativeElement, 'border', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'border-radius', '0.35rem');
    this.renderer.setStyle(this.el.nativeElement, 'font-size', '12px');
    this.renderer.setStyle(this.el.nativeElement, 'color', '#6d6d73');
    //this.renderer.setStyle(this.el.nativeElement, 'width', '100%');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'border 0.3s ease-in-out');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'rgba(0, 0, 0, 0.07) 0 1px 1px 0, rgba(0, 0, 0, 0.1) 1px 1px 1px 0');
  }

  private createLabel(): void {
    if (!this.label) return;

    this.labelElement = this.renderer.createElement('label');
    const labelText = this.renderer.createText(this.label);
    this.renderer.appendChild(this.labelElement, labelText);
    this.renderer.insertBefore(this.wrapperElement, this.labelElement, this.el.nativeElement);

    this.renderer.setStyle(this.labelElement, 'display', 'block');
    this.renderer.setStyle(this.labelElement, 'font-size', '12px');
    this.renderer.setStyle(this.labelElement, 'font-weight', 'lighter');
    this.renderer.setStyle(this.labelElement, 'text-transform', 'uppercase');
    this.renderer.setStyle(this.labelElement, 'color', '#2e3031');
    this.renderer.setStyle(this.labelElement, 'margin-bottom', '3px');
  }

  private setBorderColor(color: string): void {
    this.renderer.setStyle(this.el.nativeElement, 'border', `2px solid ${color}`);
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
