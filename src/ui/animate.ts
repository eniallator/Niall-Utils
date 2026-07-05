import { raise } from "../core/utils.ts";

/** The frame data returned for a given point in a {@link sequence}/{@link timeSequence}. */
interface SequenceResult<F> {
  frame: F;
  delta: number;
  index: number;
}

/**
 * Builds a frame-index-driven animation sequencer: given a running total, returns which frame should be
 * showing and how far through that frame's duration we are.
 * @template F The type of each frame (e.g. a sprite, a color, a string).
 * @param {F[]} frames The ordered list of frames to sequence through.
 * @param {number} perFrame How many "total" units (e.g. milliseconds) each frame lasts.
 * @param {boolean} [loop] Whether to wrap back to the first frame after the last. When `false`, the sequence holds on the last frame. Defaults to `true`.
 * @returns {(currTotal: number) => SequenceResult<F>} A function that, given a running total, returns the current `{ frame, delta, index }`.
 */
export const sequence =
  <F>(frames: F[], perFrame: number, loop: boolean = true) =>
  (currTotal: number): SequenceResult<F> => {
    const rawIndex = Math.floor(currTotal / perFrame);
    const index = loop
      ? rawIndex % frames.length
      : Math.min(rawIndex, frames.length - 1);

    return {
      index,
      frame:
        frames.at(index) ?? raise(new Error(`Frame index not found: ${index}`)),
      delta:
        loop || rawIndex < frames.length
          ? (currTotal % perFrame) / perFrame
          : 1,
    };
  };

/**
 * Time-based version of {@link sequence}: drives the frame sequence from elapsed wall-clock time instead of
 * a manually tracked total.
 * @template F The type of each frame.
 * @param {F[]} frames The ordered list of frames to sequence through.
 * @param {number} msPerFrame How many milliseconds each frame lasts.
 * @param {boolean} [loop] Whether to wrap back to the first frame after the last. Defaults to `true`.
 * @param {Date} [start] The time the sequence started. Defaults to the current time.
 * @returns {(now?: Date) => SequenceResult<F>} A function that, given the current time (defaults to now), returns the current `{ frame, delta, index }`.
 */
export const timeSequence = <F>(
  frames: F[],
  msPerFrame: number,
  loop: boolean = true,
  start: Date = new Date()
) => {
  const seq = sequence(frames, msPerFrame, loop);
  return (now: Date = new Date()) => seq(now.getTime() - start.getTime());
};

/**
 * Manages several named {@link sequence}/{@link timeSequence} animations and switches between them, resetting
 * the new sequence's start point whenever the active target changes.
 * @template S A record mapping sequence names to their frame arrays.
 * @param {S} sequences The named sequences to switch between.
 * @param {number} msPerFrame How many units (milliseconds if `temporal`, otherwise caller-defined total units) each frame lasts.
 * @param {keyof S} initial The sequence to start on.
 * @param {true} [temporal] When `true` (the default), sequences are driven by wall-clock time via {@link timeSequence}.
 * @param {Date} [start] The time the initial sequence started, only used when `temporal` is `true`. Defaults to the current time.
 * @returns {(target: keyof S, now?: Date) => SequenceResult<S[keyof S][number]>} A function that switches to (and reads) the named sequence, given the current time.
 */
export function multiSequence<S extends Record<string, unknown[]>>(
  sequences: S,
  msPerFrame: number,
  initial: keyof S,
  temporal?: true,
  start?: Date
): (target: keyof S, now?: Date) => SequenceResult<S[keyof S][number]>;
/**
 * Manages several named {@link sequence} animations and switches between them, resetting the new sequence's
 * start point whenever the active target changes. This overload is driven by a manually tracked total
 * instead of wall-clock time.
 * @template S A record mapping sequence names to their frame arrays.
 * @param {S} sequences The named sequences to switch between.
 * @param {number} msPerFrame How many total units each frame lasts.
 * @param {keyof S} initial The sequence to start on.
 * @param {false} temporal Must be `false` to select this manually-driven overload.
 * @returns {(target: keyof S, total: number) => SequenceResult<S[keyof S][number]>} A function that switches to (and reads) the named sequence, given the running total for that sequence.
 */
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
  temporal: boolean = true,
  start?: Date
) {
  const createSeq = temporal ? timeSequence : sequence;

  let last = initial;
  let seq = createSeq(
    sequences[initial] ??
      raise(new Error(`Sequence not found ${String(initial)}`)),
    msPerFrame,
    true,
    start
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
        msPerFrame,
        true,
        arg instanceof Date ? arg : undefined
      );
    }

    return seq(arg as Date & number);
  };
}
