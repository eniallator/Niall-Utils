import { raise } from "./utils.ts";

interface SequenceResult<F> {
  frame: F;
  delta: number;
}

export const sequence =
  <F>(frames: F[], perFrame: number, loop: boolean = true) =>
  (currTotal: number): SequenceResult<F> => {
    const rawIndex = Math.floor(currTotal / perFrame);
    const index = loop
      ? rawIndex % frames.length
      : Math.min(rawIndex, frames.length - 1);

    return {
      frame:
        frames.at(index) ?? raise(new Error(`Frame index not found: ${index}`)),
      delta: (currTotal % perFrame) / perFrame,
    };
  };

export const timeSequence = <F>(
  frames: F[],
  msPerFrame: number,
  loop: boolean = true,
  start: Date = new Date()
) => {
  const seq = sequence(frames, msPerFrame, loop);
  return (now: Date = new Date()) => seq(now.getTime() - start.getTime());
};

export function multiSequence<S extends Record<string, unknown[]>>(
  sequences: S,
  msPerFrame: number,
  initial: keyof S,
  temporal?: true
): (target: keyof S, now?: Date) => SequenceResult<S[keyof S][number]>;
export function multiSequence<S extends Record<string, unknown[]>>(
  sequences: S,
  msPerFrame: number,
  initial: keyof S,
  temporal: false
): (target: keyof S, total: number) => SequenceResult<S[keyof S][number]>;
export function multiSequence<S extends Record<string, unknown[]>>(
  sequences: S,
  msPerFrame: number,
  initial: keyof S,
  temporal: boolean = true
) {
  const createSeq = temporal ? timeSequence : sequence;

  let last = initial;
  let seq = createSeq(
    sequences[initial] ??
      raise(new Error(`Sequence not found ${String(initial)}`)),
    msPerFrame
  );

  return (target: keyof S, arg?: Date | number) => {
    if (!temporal && arg == null) {
      raise(new Error("multiSequences need a total argument passed in"));
    }

    if (target !== last) {
      last = target;
      seq = createSeq(
        sequences[target] ??
          raise(new Error(`Sequence not found ${String(target)}`)),
        msPerFrame
      );
    }

    return seq(arg as Date & number);
  };
}
