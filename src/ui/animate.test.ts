import { describe, expect, it } from "vitest";

import {
  multiSequence,
  sequence,
  timeMultiSequence,
  timeSequence,
} from "./animate.ts";

describe("sequence", () => {
  it("returns the correct frame and delta for a looping sequence", () => {
    const seq = sequence(["a", "b", "c"], 100, true);

    expect(seq(0)).toEqual({ frame: "a", delta: 0, index: 0 });
    expect(seq(50)).toEqual({ frame: "a", delta: 0.5, index: 0 });
    expect(seq(100)).toEqual({ frame: "b", delta: 0, index: 1 });
    expect(seq(250)).toEqual({ frame: "c", delta: 0.5, index: 2 });
    expect(seq(300)).toEqual({ frame: "a", delta: 0, index: 0 });
  });

  it("caps to the last frame when loop is false", () => {
    const seq = sequence(["x", "y"], 100, false);

    expect(seq(0)).toEqual({ frame: "x", delta: 0, index: 0 });
    expect(seq(199)).toEqual({ frame: "y", delta: 0.99, index: 1 });
    expect(seq(200)).toEqual({ frame: "y", delta: 1, index: 1 });
    expect(seq(999)).toEqual({ frame: "y", delta: 1, index: 1 });
  });

  it("wraps correctly for negative currTotal when looping", () => {
    const seq = sequence(["a", "b", "c"], 100, true);
    expect(seq(-50)).toEqual({ frame: "c", delta: 0.5, index: 2 });
  });

  it("holds on the first frame for negative currTotal when not looping", () => {
    const seq = sequence(["x", "y"], 100, false);
    expect(seq(-50)).toEqual({ frame: "x", delta: 0, index: 0 });
  });

  it("throws when frames array is empty", () => {
    const seq = sequence([], 100, true);
    expect(() => seq(0)).toThrow("Frame index not found: NaN");
  });
});

describe("timeSequence", () => {
  it("uses elapsed time from the provided start date", () => {
    const start = new Date(2026, 0, 1, 0, 0, 0, 0);
    const now = new Date(2026, 0, 1, 0, 0, 0, 150);
    const seq = timeSequence([1, 2, 3], 100, true, start);

    expect(seq(now)).toEqual({ frame: 2, delta: 0.5, index: 1 });
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

  it("switches between named sequences using a running total", () => {
    const multi = multiSequence(sequences, 100, "red");

    expect(multi("red", 150)).toEqual({ frame: "r2", delta: 0.5, index: 1 });
    expect(multi("blue", 250)).toEqual({ frame: "b3", delta: 0.5, index: 2 });
  });

  it("throws when initial sequence does not exist", () => {
    const seqData = { red: ["r1", "r2"] };
    expect(() =>
      multiSequence(seqData, 100, "blue" as keyof typeof seqData)
    ).toThrow("Sequence not found blue");
  });

  it("throws when switching to a non-existent target sequence", () => {
    const multi = multiSequence(sequences, 100, "red");

    // First call establishes 'red' as last
    multi("red", 0);

    // Switching to a non-existent sequence should throw
    expect(() => multi("green" as keyof typeof sequences, 0)).toThrow(
      "Sequence not found green"
    );
  });
});

describe("timeMultiSequence", () => {
  const sequences = {
    red: ["r1", "r2"],
    blue: ["b1", "b2", "b3"],
  };

  it("switches between named sequences using wall-clock time", () => {
    const multi = timeMultiSequence(sequences, 100, "red");
    const now = new Date();

    const redResult = multi("red", now);
    expect(["r1", "r2"]).toContain(redResult.frame);
    expect(redResult.delta).toBeGreaterThanOrEqual(0);
    expect(redResult.delta).toBeLessThan(1);

    const blueResult = multi("blue", now);
    expect(["b1", "b2", "b3"]).toContain(blueResult.frame);
    expect(blueResult.delta).toBe(0);
  });

  it("resets the elapsed-time reference point when switching targets", () => {
    const start = new Date(2026, 0, 1, 0, 0, 0, 0);
    const multi = timeMultiSequence(sequences, 100, "red", start);

    const switchTime = new Date(2026, 0, 1, 0, 0, 0, 300);
    expect(multi("blue", switchTime)).toEqual({
      frame: "b1",
      delta: 0,
      index: 0,
    });

    const later = new Date(2026, 0, 1, 0, 0, 0, 450);
    expect(multi("blue", later)).toEqual({
      frame: "b2",
      delta: 0.5,
      index: 1,
    });
  });

  it("defaults now when no date is provided", () => {
    const multi = timeMultiSequence(sequences, 100, "red");
    const result = multi("red");

    expect(["r1", "r2"]).toContain(result.frame);
    expect(result.delta).toBeGreaterThanOrEqual(0);
    expect(result.delta).toBeLessThan(1);
  });

  it("throws when initial sequence does not exist", () => {
    const seqData = { red: ["r1", "r2"] };
    expect(() =>
      timeMultiSequence(seqData, 100, "blue" as keyof typeof seqData)
    ).toThrow("Sequence not found blue");
  });

  it("throws when switching to a non-existent target sequence", () => {
    const multi = timeMultiSequence(sequences, 100, "red");
    const now = new Date();

    multi("red", now);

    expect(() => multi("green" as keyof typeof sequences, now)).toThrow(
      "Sequence not found green"
    );
  });
});
