export const raise = (error: Error): never => {
  throw error;
};

export const checkExhausted = (value: never) =>
  raise(new Error(`Value not exhausted: ${JSON.stringify(value)}`));

export function attempt<T>(unsafeCb: () => T): T | null;
export function attempt<T>(unsafeCb: () => T, onError: () => T): T;
export function attempt<T>(unsafeCb: () => T, onError?: () => T): T | null {
  try {
    return unsafeCb();
  } catch {
    return onError?.() ?? null;
  }
}
