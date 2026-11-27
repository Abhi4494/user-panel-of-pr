import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';

type ToastKind = 'error' | 'success';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const DISMISS_AFTER_MS = 6000;

let toasts: readonly Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: readonly Toast[]) {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number) {
  emit(toasts.filter((toast) => toast.id !== id));
}

/** Shows a message in the top-right corner; it closes itself after a few seconds. Needs `<Toaster />` mounted once. */
export function showToast(kind: ToastKind, message: string) {
  const id = nextId++;
  emit([...toasts, { id, kind, message }]);
  setTimeout(() => dismissToast(id), DISMISS_AFTER_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const kindStyles: Record<ToastKind, { box: string; Icon: typeof CircleAlert }> = {
  error: { box: 'bg-alert', Icon: CircleAlert },
  success: { box: 'bg-valid-text', Icon: CheckCircle2 },
};

/** Renders the active toasts. Mount once near the app root. */
export function Toaster() {
  const items = useSyncExternalStore(subscribe, () => toasts);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
      {items.map(({ id, kind, message }) => {
        const { box, Icon } = kindStyles[kind];
        return (
          <div
            key={id}
            role={kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg p-3 text-white shadow-card ${box}`}
          >
            <Icon size={18} aria-hidden className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismissToast(id)}
              className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
