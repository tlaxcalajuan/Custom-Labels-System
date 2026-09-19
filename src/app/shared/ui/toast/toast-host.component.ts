import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Toast, ToastKind, ToastService } from './toast.service';

/**
 * Host visual de las notificaciones. Se coloca una sola vez en `app.html`
 * y consume la señal `toasts` del servicio. Los toasts se apilan en la
 * esquina inferior derecha y desaparecen automáticamente.
 */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="toast-host" aria-live="polite" aria-atomic="true">
      @for (toast of toasts(); track toast.id) {
        <button
          type="button"
          class="toast"
          [class]="'toast toast--' + toast.kind"
          (click)="dismiss(toast.id)"
          [attr.aria-label]="'Notificación: ' + toast.message + '. Toca para descartar.'"
        >
          <span class="toast__icon" aria-hidden="true">{{ icon(toast.kind) }}</span>
          <span class="toast__message">{{ toast.message }}</span>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        pointer-events: none;
      }

      .toast-host {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        max-width: min(360px, calc(100vw - 32px));
      }

      .toast {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: #111827;
        color: #f9fafb;
        font: inherit;
        font-size: 14px;
        line-height: 1.35;
        text-align: left;
        cursor: pointer;
        box-shadow: 0 10px 25px rgb(0 0 0 / 25%);
        animation: toast-in 180ms ease-out;
        max-width: 100%;
      }

      .toast:hover {
        filter: brightness(1.05);
      }

      .toast:focus-visible {
        outline: 2px solid #a5b4fc;
        outline-offset: 2px;
      }

      .toast__icon {
        flex: 0 0 auto;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-size: 13px;
        font-weight: 700;
      }

      .toast__message {
        flex: 1 1 auto;
        min-width: 0;
        overflow-wrap: anywhere;
      }

      .toast--success {
        background: #065f46;
        border-color: #047857;
      }
      .toast--success .toast__icon {
        background: #10b981;
        color: #052e2b;
      }

      .toast--error {
        background: #7f1d1d;
        border-color: #991b1b;
      }
      .toast--error .toast__icon {
        background: #ef4444;
        color: #450a0a;
      }

      .toast--info {
        background: #1e3a8a;
        border-color: #1d4ed8;
      }
      .toast--info .toast__icon {
        background: #60a5fa;
        color: #0b1a3a;
      }

      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media print {
        .toast-host {
          display: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);

  protected readonly toasts = this.toastService.toasts;

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  protected icon(kind: ToastKind): string {
    switch (kind) {
      case 'success':
        return '✓';
      case 'error':
        return '!';
      case 'info':
      default:
        return 'i';
    }
  }
}
