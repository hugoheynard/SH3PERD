import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

/**
 * Lightweight toast/snackbar notification service.
 *
 * Usage:
 * ```ts
 * toast.show('Track uploaded', 'success');
 * toast.show('Analysis failed', 'error', 5000);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, variant: ToastVariant = 'info', durationMs = 3000): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      variant,
      durationMs,
    };

    this._toasts.update(list => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
