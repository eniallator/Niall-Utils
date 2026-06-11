export function attempt<T>(unsafeCb: () => T): T | null;
export function attempt<T>(unsafeCb: () => T, onError: () => T): T;
export function attempt<T>(unsafeCb: () => T, onError?: () => T): T | null {
  try {
    return unsafeCb();
  } catch {
    return onError?.() ?? null;
  }
}

export async function asyncAttempt<T>(
  unsafeCb: () => Promise<T>
): Promise<T | null>;
export async function asyncAttempt<T>(
  unsafeCb: () => Promise<T>,
  onError: () => T
): Promise<T>;
export async function asyncAttempt<T>(
  unsafeCb: () => Promise<T>,
  onError?: () => T
): Promise<T | null> {
  try {
    return await unsafeCb();
  } catch {
    return onError?.() ?? null;
  }
}
