import { describe, expect, it } from "vitest";

import { multiSequence, sequence, timeSequence } from "./animate";

describe("sequence", () => {
  it("returns the correct frame and delta for a looping sequence", () => {
    const seq = sequence(["a", "b", "c"], 100, true);

    expect(seq(0)).toEqual({ frame: "a", delta: 0 });
    expect(seq(50)).toEqual({ frame: "a", delta: 0.5 });
    expect(seq(100)).toEqual({ frame: "b", delta: 0 });
    expect(seq(250)).toEqual({ frame: "c", delta: 0.5 });
    expect(seq(300)).toEqual({ frame: "a", delta: 0 });
  });

  it("caps to the last frame when loop is false", () => {
    const seq = sequence(["x", "y"], 100, false);

    expect(seq(0)).toEqual({ frame: "x", delta: 0 });
    expect(seq(199)).toEqual({ frame: "y", delta: 0.99 });
    expect(seq(200)).toEqual({ frame: "y", delta: 1 });
    expect(seq(999)).toEqual({ frame: "y", delta: 1 });
  });
});

describe("timeSequence", () => {
  it("uses elapsed time from the provided start date", () => {
    const start = new Date(2026, 0, 1, 0, 0, 0, 0);
    const now = new Date(2026, 0, 1, 0, 0, 0, 150);
    const seq = timeSequence([1, 2, 3], 100, true, start);

    expect(seq(now)).toEqual({ frame: 2, delta: 0.5 });
  });

  it("defaults now when no date is provided", () => {
    const start = new Date(Date.now() - 50);
    const seq = timeSequence([5, 6], 100, true, start);
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

  it("switches between named sequences and remains temporal by default", () => {
    const multi = multiSequence(sequences, 100, "red", true);
    const now = new Date();

    const redResult = multi("red", now);
    expect(["r1", "r2"]).toContain(redResult.frame);
    expect(redResult.delta).toBeGreaterThanOrEqual(0);
    expect(redResult.delta).toBeLessThan(1);

    const blueResult = multi("blue", now);
    expect(["b1", "b2", "b3"]).toContain(blueResult.frame);
    expect(blueResult.delta).toBeGreaterThanOrEqual(0);
    expect(blueResult.delta).toBeLessThan(1);
  });

  it("uses total values when temporal is false", () => {
    const multi = multiSequence(sequences, 100, "red", false);

    expect(multi("red", 150)).toEqual({ frame: "r2", delta: 0.5 });
    expect(multi("blue", 250)).toEqual({ frame: "b3", delta: 0.5 });
  });

  it("throws when non-temporal is called without a total argument", () => {
    const multi = multiSequence(sequences, 100, "red", false);
    expect(() => (multi as (arg: string) => unknown)("red")).toThrow(
      "multiSequences need a total argument passed in"
    );
  });
});
