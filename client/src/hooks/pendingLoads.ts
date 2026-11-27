import { useSyncExternalStore } from 'react';

/**
 * Counts data requests that are currently in flight, so the page loader can stay up until the new screen has its data.
 * `useAsync` registers every request here; nothing else needs to know about it.
 */
let pending = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Marks one request as started; call the returned function when it settles (safe to call more than once). */
export function beginPendingLoad(): () => void {
  pending += 1;
  emit();
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    pending -= 1;
    emit();
  };
}

/** Number of requests in flight right now. */
export function usePendingLoads() {
  return useSyncExternalStore(subscribe, () => pending);
}
