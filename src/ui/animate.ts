import { raise } from "../core/utils.ts";
import { pipeable } from "../functional/pipeable.ts";
import { clamp, positiveMod } from "../math/maths.ts";

/** The frame data returned for a given point in a {@link sequence}/{@link timeSequence}. */
export interface SequenceResult<F> {
  /** The frame showing. */
  frame: F;
  /** Where that frame sits in the frames list. */
  index: number;
  /** Progress through the frame, from 0 to 1 (1 only once a non-looping sequence is done). */
  delta: number;
  /** Whether a non-looping sequence has finished. */
  done: boolean;
  /** How many times a looping sequence has wrapped around (always 0 when not looping). */
  cycle: number;
}

/**
 * Options for {@link sequence}. Every frame lasts either `perFrame` or `frameDuration(frame)`; passing both
 * throws.
 */
export type SequenceOptions<F> = {
  /** Wrap to the first frame after the last, otherwise hold on the last. Defaults to `true`. */
  loop?: boolean;
} & ({ perFrame: number } | { frameDuration: (frame: F) => number });

/** Options for {@link timeSequence}: as {@link SequenceOptions}, with durations in milliseconds. */
export type TimeSequenceOptions<F> = SequenceOptions<F> & {
  /** When the sequence started. */
  start: Date;
};

const assertSingleTiming = (timing: object): void => {
  if ("perFrame" in timing && "frameDuration" in timing) {
    throw new Error("Give perFrame or frameDuration, not both");
  }
};

/** The shared implementation behind every function here. */
const frameAt = <F>(
  total: number,
  frames: readonly F[],
  options: SequenceOptions<F>
): SequenceResult<F> => {
  assertSingleTiming(options);

  const timed = frames.map((frame, index) => {
    const duration =
      "frameDuration" in options
        ? options.frameDuration(frame)
        : options.perFrame;
    return Number.isFinite(duration) && duration > 0
      ? { index, frame, duration }
      : raise(
          new Error(`Frame durations must be positive numbers, got ${duration}`)
        );
  });

  const loop = options.loop ?? true;
  const length = timed.reduce((sum, { duration }) => sum + duration, 0);
  const position = loop ? positiveMod(total, length) : clamp(total, 0, length);

  // The frame `position` falls in, or the last one if we are at (or past) the end.
  let start = 0;
  let found: ((typeof timed)[number] & { start: number }) | undefined;
  for (const entry of timed) {
    found = { ...entry, start };
    if (position < start + entry.duration) break;
    start += entry.duration;
  }
  if (found === undefined) {
    throw new Error("Cannot sequence an empty list of frames");
  }

  return {
    index: found.index,
    frame: found.frame,
    delta: (position - found.start) / found.duration,
    done: !loop && total >= length,
    cycle: loop ? Math.floor(total / length) : 0,
  };
};

/**
 * The frame showing at a running total, and how far through it we are. Pure: it keeps no state.
 * Pipeable on the total: `sequence(total, frames, options)`, or `sequence(frames, options)(total)`.
 *
 * The total can be any unit (time, distance, ticks) as long as the durations match, e.g. a belt that
 * advances a frame per 0.125 tiles: `sequence(seconds * tilesPerSecond, frames, { perFrame: 0.125 })`.
 */
export const sequence = pipeable<{
  /**
   * Data-first: the result at `total`.
   * @param {number} total The running total, in the same unit as the frame durations.
   * @param {readonly F[]} frames The frames to sequence through. Must not be empty.
   * @param {SequenceOptions<F>} options How long each frame lasts, and whether to loop.
   * @returns {SequenceResult<F>} The current `{ frame, index, delta, done, cycle }`.
   */
  <F>(
    total: number,
    frames: readonly F[],
    options: SequenceOptions<F>
  ): SequenceResult<F>;
  /**
   * Data-last: builds a function from a total to the result.
   * @param {readonly F[]} frames The frames to sequence through. Must not be empty.
   * @param {SequenceOptions<F>} options How long each frame lasts, and whether to loop.
   * @returns {(total: number) => SequenceResult<F>} A function from a running total to the current result.
   */
  <F>(
    frames: readonly F[],
    options: SequenceOptions<F>
  ): (total: number) => SequenceResult<F>;
}>(frameAt, ([first]) => typeof first === "number");

/**
 * {@link sequence} driven by wall-clock time since `options.start`, with durations in milliseconds.
 * Pipeable on `now`: `timeSequence(now, frames, options)`, or `timeSequence(frames, options)(now?)`.
 * `start` is required because the data-last form can't default it when the function is built.
 */
export const timeSequence = pipeable<{
  /**
   * Data-first: the result at `now`.
   * @param {Date} now The current time.
   * @param {readonly F[]} frames The frames to sequence through. Must not be empty.
   * @param {TimeSequenceOptions<F>} options When it started, how long each frame lasts (ms), and whether to loop.
   * @returns {SequenceResult<F>} The current `{ frame, index, delta, done, cycle }`.
   */
  <F>(
    now: Date,
    frames: readonly F[],
    options: TimeSequenceOptions<F>
  ): SequenceResult<F>;
  /**
   * Data-last: builds a function from the current time to the result.
   * @param {readonly F[]} frames The frames to sequence through. Must not be empty.
   * @param {TimeSequenceOptions<F>} options When it started, how long each frame lasts (ms), and whether to loop.
   * @returns {(now?: Date) => SequenceResult<F>} A function from the current time (defaults to now) to the current result.
   */
  <F>(
    frames: readonly F[],
    options: TimeSequenceOptions<F>
  ): (now?: Date) => SequenceResult<F>;
}>(
  <F>(
    // Undefined when the data-last function is called without a time.
    now: Date | undefined,
    frames: readonly F[],
    options: TimeSequenceOptions<F>
  ): SequenceResult<F> =>
    frameAt(
      (now ?? new Date()).getTime() - options.start.getTime(),
      frames,
      options
    ),
  ([first]) => first instanceof Date
);

type NamedSequences = Record<string, readonly unknown[]>;

type FramesOf<S extends NamedSequences> = S[keyof S][number];

/** One value for every named sequence, or a record giving each its own. */
type PerSequence<S extends NamedSequences, T> = T | Record<keyof S, T>;

/** Options for {@link multiSequence}: as {@link SequenceOptions}, with `perFrame` and `loop` optionally per sequence. */
export type MultiSequenceOptions<S extends NamedSequences> = {
  /** Wrap to the first frame after the last, otherwise hold on the last. Defaults to `true`. */
  loop?: PerSequence<S, boolean>;
} & (
  | { perFrame: PerSequence<S, number> }
  | { frameDuration: (frame: FramesOf<S>) => number }
);

/**
 * What {@link multiSequence} remembers between calls: the sequence showing and when it began (a number, or
 * a `Date` for {@link timeMultiSequence}).
 */
export interface MultiSequenceState<S extends NamedSequences, Start> {
  /** The sequence that was showing. */
  target: keyof S;
  /** When that sequence began, in the same unit as the `now` it was given. */
  startedAt: Start;
}

/** A {@link multiSequence} result: the frame data, plus the `state` to pass into the next call. */
export type MultiSequenceResult<
  S extends NamedSequences,
  Start,
> = SequenceResult<FramesOf<S>> & { state: MultiSequenceState<S, Start> };

/**
 * Switches between named {@link sequence} animations, restarting the new one from its first frame whenever
 * the target changes.
 *
 * Stateless: pass each result's `state` into the next call for the same animated thing. Without one,
 * `target` starts at `now`. Durations work as in {@link sequence}.
 * @param {S} sequences The named sequences to switch between. None may be empty.
 * @param {MultiSequenceOptions<S>} options How long each frame lasts, and whether to loop.
 * @returns {(target: keyof S, now: number, state?: MultiSequenceState<S, number>) => MultiSequenceResult<S, number>} A function that reads `target` at `now`, given the previous `state`.
 */
export const multiSequence = <S extends NamedSequences>(
  sequences: S,
  options: MultiSequenceOptions<S>
): ((
  target: keyof S,
  now: number,
  state?: MultiSequenceState<S, number>
) => MultiSequenceResult<S, number>) => {
  assertSingleTiming(options);

  return (target, now, state) => {
    const startedAt = state?.target === target ? state.startedAt : now;

    const forTarget = <T>(value: PerSequence<S, T>, name: string): T =>
      typeof value === "object" && value !== null
        ? ((value as Record<keyof S, T>)[target] ??
          raise(new Error(`${name} not found ${String(target)}`)))
        : value;

    const frames =
      sequences[target] ??
      raise(new Error(`Sequence not found ${String(target)}`));
    const loop = forTarget(options.loop ?? true, "Loop setting");

    return {
      ...frameAt(
        now - startedAt,
        frames,
        "frameDuration" in options
          ? { frameDuration: options.frameDuration, loop }
          : {
              perFrame: forTarget(options.perFrame, "Frame duration"),
              loop,
            }
      ),
      state: { target, startedAt },
    };
  };
};

/**
 * {@link multiSequence} driven by `Date`s, with durations in milliseconds.
 * @param {S} sequences The named sequences to switch between. None may be empty.
 * @param {MultiSequenceOptions<S>} options How long each frame lasts (ms), and whether to loop.
 * @returns {(target: keyof S, now?: Date, state?: MultiSequenceState<S, Date>) => MultiSequenceResult<S, Date>} A function that reads `target` at `now` (defaults to now), given the previous `state`.
 */
export const timeMultiSequence = <S extends NamedSequences>(
  sequences: S,
  options: MultiSequenceOptions<S>
): ((
  target: keyof S,
  now?: Date,
  state?: MultiSequenceState<S, Date>
) => MultiSequenceResult<S, Date>) => {
  const multi = multiSequence(sequences, options);

  return (target, now, state) => {
    const { state: next, ...result } = multi(
      target,
      (now ?? new Date()).getTime(),
      state && { target: state.target, startedAt: state.startedAt.getTime() }
    );
    return {
      ...result,
      state: { target: next.target, startedAt: new Date(next.startedAt) },
    };
  };
};
