import { describe, expect, it } from "vitest";

import {
  multiSequence,
  sequence,
  timeMultiSequence,
  timeSequence,
} from "./animate.ts";

const at = <F>(
  frame: F,
  index: number,
  delta: number,
  cycle = 0,
  done = false
) => ({
  frame,
  index,
  delta,
  done,
  cycle,
});

describe("sequence", () => {
  it("returns the correct frame and delta for a looping sequence", () => {
    const seq = sequence(["a", "b", "c"], { perFrame: 100 });

    expect(seq(0)).toEqual(at("a", 0, 0));
    expect(seq(50)).toEqual(at("a", 0, 0.5));
    expect(seq(100)).toEqual(at("b", 1, 0));
    expect(seq(250)).toEqual(at("c", 2, 0.5));
    expect(seq(300)).toEqual(at("a", 0, 0, 1));
    expect(seq(650)).toEqual(at("a", 0, 0.5, 2));
  });

  it("can be called data-first with the total as the first argument", () => {
    const frames = ["a", "b", "c"];
    expect(sequence(250, frames, { perFrame: 100 })).toEqual(at("c", 2, 0.5));
    expect(sequence(250, frames, { perFrame: 100, loop: true })).toEqual(
      sequence(frames, { perFrame: 100 })(250)
    );
  });

  it("holds on the last frame and reports done when loop is false", () => {
    const seq = sequence(["x", "y"], { perFrame: 100, loop: false });

    expect(seq(0)).toEqual(at("x", 0, 0));
    expect(seq(199)).toEqual(at("y", 1, 0.99));
    expect(seq(200)).toEqual(at("y", 1, 1, 0, true));
    expect(seq(999)).toEqual(at("y", 1, 1, 0, true));
  });

  it("wraps correctly for negative totals when looping", () => {
    const seq = sequence(["a", "b", "c"], { perFrame: 100 });
    expect(seq(-50)).toEqual(at("c", 2, 0.5, -1));
  });

  it("holds on the first frame for negative totals when not looping", () => {
    const seq = sequence(["x", "y"], { perFrame: 100, loop: false });
    expect(seq(-50)).toEqual(at("x", 0, 0));
  });

  it("uses each frame's own duration from frameDuration", () => {
    const frames = [
      { name: "a", ms: 100 },
      { name: "b", ms: 300 },
    ];
    const seq = sequence(frames, { frameDuration: ({ ms }) => ms });

    expect(seq(50)).toEqual(at(frames[0], 0, 0.5));
    expect(seq(100)).toEqual(at(frames[1], 1, 0));
    expect(seq(250)).toEqual(at(frames[1], 1, 0.5));
    expect(seq(400)).toEqual(at(frames[0], 0, 0, 1));
  });

  it("accepts readonly frames", () => {
    const frames = ["a", "b"] as const;
    expect(sequence(150, frames, { perFrame: 100 }).frame).toBe("b");
  });

  it("works with totals that are not time", () => {
    // A belt whose frame changes every 0.125 tiles carried.
    const distance = sequence([0, 1, 2, 3], { perFrame: 0.125 });
    expect(distance(0).index).toBe(0);
    expect(distance(0.13).index).toBe(1);
    expect(distance(0.5)).toEqual(at(0, 0, 0, 1));
  });

  it("is stateless", () => {
    const seq = sequence(["a", "b"], { perFrame: 100 });
    expect(seq(150)).toEqual(seq(150));
    seq(50);
    expect(seq(150)).toEqual(at("b", 1, 0.5));
  });

  it("throws for an empty frame list", () => {
    expect(() => sequence(0, [], { perFrame: 100 })).toThrow(
      "Cannot sequence an empty list of frames"
    );
  });

  it("throws for durations that are not positive numbers", () => {
    for (const perFrame of [0, -1, NaN, Infinity]) {
      expect(() => sequence(0, ["a"], { perFrame })).toThrow(
        "Frame durations must be positive numbers"
      );
    }
    expect(() => sequence(0, ["a", "b"], { frameDuration: () => 0 })).toThrow(
      "Frame durations must be positive numbers"
    );
  });

  it("throws when given both perFrame and frameDuration", () => {
    expect(() =>
      sequence(0, ["a"], { perFrame: 100, frameDuration: () => 100 })
    ).toThrow("Give perFrame or frameDuration, not both");
  });

  it("requires a frame duration of one kind or the other", () => {
    // @ts-expect-error neither perFrame nor frameDuration
    expect(() => sequence(0, ["a"], {})).toThrow();
  });
});

describe("timeSequence", () => {
  const start = new Date(2026, 0, 1, 0, 0, 0, 0);
  const after = (ms: number) => new Date(start.getTime() + ms);

  it("uses elapsed time from the provided start date", () => {
    const seq = timeSequence([1, 2, 3], { perFrame: 100, start });
    expect(seq(after(150))).toEqual(at(2, 1, 0.5));
  });

  it("loops by default and holds when loop is false", () => {
    expect(
      timeSequence([1, 2, 3], { perFrame: 100, start })(after(350))
    ).toEqual(at(1, 0, 0.5, 1));
    expect(
      timeSequence([1, 2, 3], { perFrame: 100, start, loop: false })(after(350))
    ).toEqual(at(3, 2, 1, 0, true));
  });

  it("can be called data-first with the current time as the first argument", () => {
    expect(
      timeSequence(after(150), [1, 2, 3], { perFrame: 100, start })
    ).toEqual(at(2, 1, 0.5));
  });

  it("supports per-frame durations", () => {
    const seq = timeSequence([1, 2], { frameDuration: n => n * 100, start });
    expect(seq(after(150))).toEqual(at(2, 1, 0.25));
  });

  it("defaults now when no date is provided", () => {
    const seq = timeSequence([5, 6], {
      perFrame: 100,
      start: new Date(Date.now() - 50),
    });
    const result = seq();

    expect([5, 6]).toContain(result.frame);
    expect(result.delta).toBeGreaterThanOrEqual(0);
    expect(result.delta).toBeLessThan(1);
  });
});

describe("multiSequence", () => {
  const sequences = {
    red: ["r1", "r2"],
    blue: ["b1", "b2", "b3"],
  };

  it("starts the target at now when there is no state", () => {
    const multi = multiSequence(sequences, { perFrame: 100 });

    expect(multi("red", 1000)).toEqual({
      ...at("r1", 0, 0),
      state: { target: "red", startedAt: 1000 },
    });
  });

  it("keeps time going when fed its own state back", () => {
    const multi = multiSequence(sequences, { perFrame: 100 });

    const first = multi("red", 1000);
    const second = multi("red", 1150, first.state);

    expect(second).toEqual({
      ...at("r2", 1, 0.5),
      state: { target: "red", startedAt: 1000 },
    });
  });

  it("restarts the new sequence from its first frame when the target changes", () => {
    const multi = multiSequence(sequences, { perFrame: 100 });

    const red = multi("red", 1150, multi("red", 1000).state);
    const blue = multi("blue", 1250, red.state);
    expect(blue).toEqual({
      ...at("b1", 0, 0),
      state: { target: "blue", startedAt: 1250 },
    });

    expect(multi("blue", 1450, blue.state)).toEqual({
      ...at("b3", 2, 0),
      state: { target: "blue", startedAt: 1250 },
    });
    // And back again: also restarts.
    expect(multi("red", 1500, blue.state).state.startedAt).toBe(1500);
  });

  it("starts earlier when given a state to begin from", () => {
    const multi = multiSequence(sequences, { perFrame: 100 });
    expect(
      multi("blue", 1250, { target: "blue", startedAt: 1000 })
    ).toMatchObject(at("b3", 2, 0.5));
  });

  it("is stateless: it never changes the state it is given", () => {
    const multi = multiSequence(sequences, { perFrame: 100 });
    const state = multi("red", 1000).state;

    multi("blue", 5000, state);

    expect(state).toEqual({ target: "red", startedAt: 1000 });
    expect(multi("red", 1150, state)).toEqual(multi("red", 1150, state));
  });

  it("gives each sequence its own duration when perFrame is a record", () => {
    const multi = multiSequence(sequences, {
      perFrame: { red: 100, blue: 10 },
    });

    const start = multi("blue", 0);
    expect(multi("blue", 25, start.state)).toMatchObject(at("b3", 2, 0.5));
    expect(multi("red", 25, start.state)).toMatchObject(at("r1", 0, 0));
  });

  it("uses frameDuration for each frame", () => {
    const timed = {
      idle: [{ ms: 500 }],
      walk: [{ ms: 100 }, { ms: 300 }],
    };
    const multi = multiSequence(timed, { frameDuration: ({ ms }) => ms });

    const start = multi("walk", 0);
    expect(multi("walk", 250, start.state)).toMatchObject(
      at(timed.walk[1], 1, 0.5)
    );
  });

  it("lets loop be set per sequence", () => {
    const multi = multiSequence(sequences, {
      perFrame: 100,
      loop: { red: false, blue: true },
    });

    expect(multi("red", 999, { target: "red", startedAt: 0 })).toMatchObject(
      at("r2", 1, 1, 0, true)
    );
    expect(multi("blue", 300, { target: "blue", startedAt: 0 })).toMatchObject(
      at("b1", 0, 0, 1)
    );
  });

  it("lets loop be set for every sequence", () => {
    const multi = multiSequence(sequences, { perFrame: 100, loop: false });
    expect(multi("blue", 999, { target: "blue", startedAt: 0 }).done).toBe(
      true
    );
  });

  it("throws for a sequence that does not exist", () => {
    const multi = multiSequence(sequences, { perFrame: 100 });
    expect(() => multi("green" as keyof typeof sequences, 0)).toThrow(
      "Sequence not found green"
    );
  });

  it("throws when a record has no entry for the target sequence", () => {
    const partialDurations = { red: 100 } as Record<
      keyof typeof sequences,
      number
    >;
    const partialLoops = { red: true } as Record<
      keyof typeof sequences,
      boolean
    >;

    expect(() =>
      multiSequence(sequences, { perFrame: partialDurations })("blue", 0)
    ).toThrow("Frame duration not found blue");
    expect(() =>
      multiSequence(sequences, { perFrame: 100, loop: partialLoops })("blue", 0)
    ).toThrow("Loop setting not found blue");
  });

  it("throws when given both perFrame and frameDuration", () => {
    expect(() =>
      multiSequence(sequences, { perFrame: 100, frameDuration: () => 100 })
    ).toThrow("Give perFrame or frameDuration, not both");
  });
});

describe("timeMultiSequence", () => {
  const sequences = {
    red: ["r1", "r2"],
    blue: ["b1", "b2", "b3"],
  };
  const start = new Date(2026, 0, 1, 0, 0, 0, 0);
  const after = (ms: number) => new Date(start.getTime() + ms);

  it("starts the target at now when there is no state", () => {
    const multi = timeMultiSequence(sequences, { perFrame: 100 });

    expect(multi("red", start)).toEqual({
      ...at("r1", 0, 0),
      state: { target: "red", startedAt: start },
    });
  });

  it("restarts from the moment the target changes", () => {
    const multi = timeMultiSequence(sequences, { perFrame: 100 });

    const red = multi("red", start);
    const blue = multi("blue", after(300), red.state);
    expect(blue).toEqual({
      ...at("b1", 0, 0),
      state: { target: "blue", startedAt: after(300) },
    });
    expect(multi("blue", after(450), blue.state)).toMatchObject(
      at("b2", 1, 0.5)
    );
  });

  it("does not change the state it is given", () => {
    const multi = timeMultiSequence(sequences, { perFrame: 100 });
    const state = multi("red", start).state;

    multi("blue", after(300), state);

    expect(state).toEqual({ target: "red", startedAt: start });
  });

  it("defaults now when no date is provided", () => {
    const multi = timeMultiSequence(sequences, { perFrame: 100 });
    const result = multi("red");

    expect(result.frame).toBe("r1");
    expect(result.state.startedAt).toBeInstanceOf(Date);
  });

  it("throws for a sequence that does not exist", () => {
    const multi = timeMultiSequence(sequences, { perFrame: 100 });
    expect(() => multi("green" as keyof typeof sequences, start)).toThrow(
      "Sequence not found green"
    );
  });
});
