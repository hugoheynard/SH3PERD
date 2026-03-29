import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'sh3-toast-container',
  standalone: true,
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div class="toast" [class]="toast.variant" (click)="toastService.dismiss(toast.id)">
        <span class="toast-icon">
          @switch (toast.variant) {
            @case ('success') { ✓ }
            @case ('error')   { ✕ }
            @case ('warning') { ⚠ }
            @default          { ℹ }
          }
        </span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    }
  `,
  styleUrl: './toast-container.component.scss',
  host: { class: 'toast-host' },
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
