import {
  type AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input, ViewChild
} from '@angular/core';
import {CdkAccordion, CdkAccordionItem} from '@angular/cdk/accordion';
import {MatIcon} from '@angular/material/icon';
import {CommonModule, NgIf} from '@angular/common';

@Component({
  selector: 'plv-section-container',
  imports: [
    CommonModule,
    CdkAccordion,
    CdkAccordionItem,
    MatIcon,
    NgIf
  ],
  templateUrl: './plv-section-container.component.html',
  standalone: true,
  styleUrl: './plv-section-container.component.scss'
})
export class PlvSectionContainerComponent implements AfterViewChecked{
  @Input() title: string = '';
  @Input() isExpanded: boolean = false;
  @Input() nestingLevel: number = 1;
  @ViewChild('toggleButton', { static: false }) toggleButton!: ElementRef<HTMLButtonElement>;
  @ViewChild(CdkAccordionItem) accordionItem!: CdkAccordionItem;
  private initialized: boolean = false;

  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);


  ngAfterViewChecked(): void {
    if (!this.initialized && this.isExpanded) {
      this.initialized = true;
      if (this.accordionItem) {
        this.accordionItem.expanded = this.isExpanded;
        this.cdr.detectChanges();
      }
    }
  }
}
