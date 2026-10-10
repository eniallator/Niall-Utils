import { describe, expect, it } from "vitest";

import {
  filterObject,
  mapObject,
  mapRecord,
  omit,
  pick,
  typedFromEntries,
  typedKeys,
  typedToEntries,
} from "./entries.ts";

describe("typedKeys", () => {
  it("returns string keys by default", () => {
    expect(typedKeys({ a: 1, b: 2 }).sort()).toEqual(["a", "b"]);
  });

  it("includes symbol keys if requested", () => {
    const sym = Symbol("s");
    const obj = { a: 1, [sym]: 2 };
    const keys = typedKeys(obj, true);
    expect(keys).toHaveLength(2);
    expect(keys).toContain("a");
    expect(keys).toContain(sym);
  });

  it("returns empty array for empty object", () => {
    expect(typedKeys({})).toEqual([]);
  });

  it("excludes non-enumerable own properties", () => {
    const cmpFn = (a: unknown, b: unknown) => (String(a) > String(b) ? 1 : -1);
    expect(typedKeys(["a", "b"]).sort(cmpFn)).toEqual(["0", "1"]);

    const obj: { a: number; hidden?: number } = { a: 1 };
    Object.defineProperty(obj, "hidden", { value: 2, enumerable: false });
    expect(typedKeys(obj)).toEqual(["a"]);
  });

  it("excludes non-enumerable symbol keys when includeSymbols is true", () => {
    const visible = Symbol("visible");
    const hidden = Symbol("hidden");
    const obj = { [visible]: 1 };
    Object.defineProperty(obj, hidden, { value: 2, enumerable: false });
    expect(typedKeys(obj, true)).toEqual([visible]);
  });
});

describe("typedToEntries", () => {
  it("returns entries for object", () => {
    expect(typedToEntries({ a: 1, b: 2 })).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("includes symbol entries if requested", () => {
    const sym = Symbol("s");
    const obj = { a: 1, [sym]: 2 };
    const entries = typedToEntries(obj, true);
    expect(entries).toHaveLength(2);
    expect(entries).toContainEqual(["a", 1]);
    expect(entries).toContainEqual([sym, 2]);
  });

  it("returns empty array for empty object", () => {
    expect(typedToEntries({})).toEqual([]);
  });
});

describe("typedFromEntries", () => {
  it("creates object from entries", () => {
    expect(
      typedFromEntries([
        ["a", 1],
        ["b", 2],
      ])
    ).toEqual({ a: 1, b: 2 });
  });

  it("handles symbol keys", () => {
    const sym = Symbol("s");
    const obj = typedFromEntries<Record<"a" | typeof sym, number>>([
      [sym, 42],
      ["a", 1],
    ]);
    expect(obj[sym]).toBe(42);
    expect(obj["a"]).toBe(1);
  });

  it("returns empty object for empty entries", () => {
    expect(typedFromEntries([])).toEqual({});
  });
});

describe("mapObject", () => {
  it("maps values and keys", () => {
    const result = mapObject({ a: 1, b: 2 }, ([k, v]) => [k, v * 2]);
    expect(result).toEqual({ a: 2, b: 4 });
  });

  it("can change keys", () => {
    const result = mapObject({ a: 1 }, () => ["b", 5]);
    expect(result).toEqual({ b: 5 });
  });

  it("returns empty object for empty input", () => {
    expect(mapObject({}, ([k, v]) => [k, v])).toEqual({});
  });

  it("supports the data-last call style", () => {
    const double = mapObject<Record<string, number>, Record<string, number>>(
      ([k, v]) => [k, v * 2]
    );
    expect(double({ a: 1, b: 2 })).toEqual({ a: 2, b: 4 });
  });

  it("includes symbol keys in the data-last call style when asked", () => {
    const sym = Symbol("s");
    const identity = mapObject<Record<symbol, number>, Record<symbol, number>>(
      ([k, v]) => [k, v],
      true
    );
    expect(identity({ [sym]: 1 })).toEqual({ [sym]: 1 });
  });
});

describe("filterObject", () => {
  it("filters entries by value", () => {
    const result = filterObject({ a: 1, b: 2 }, ([, v]) => v > 1);
    expect(result).toEqual({ b: 2 });
  });

  it("filters entries by key", () => {
    const result = filterObject({ a: 1, b: 2 }, ([k]) => k === "a");
    expect(result).toEqual({ a: 1 });
  });

  it("returns empty object if all filtered out", () => {
    expect(filterObject({ a: 1 }, () => false)).toEqual({});
  });

  it("supports the data-last call style", () => {
    const big = filterObject<Record<string, number>>(([, v]) => v > 1);
    expect(big({ a: 1, b: 2 })).toEqual({ b: 2 });
  });

  it("includes symbol keys in the data-last call style when asked", () => {
    const sym = Symbol("s");
    const keepAll = filterObject<Record<string | symbol, number>>(
      () => true,
      true
    );
    expect(keepAll({ [sym]: 1, a: 2 })).toEqual({ [sym]: 1, a: 2 });
  });
});

describe("pick", () => {
  it("picks specified keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("returns empty object if no keys match", () => {
    expect(pick({ a: 1 }, ["b" as "a"])).toEqual({});
  });

  it("returns empty object for empty keys array", () => {
    expect(pick({ a: 1 }, [])).toEqual({});
  });

  it("supports the data-last (curried) call form", () => {
    expect(pick(["a", "c"])({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, c: 3 });
  });

  it("supports symbol keys in the data-last (curried) call form", () => {
    const sym = Symbol("s");
    const obj = { a: 1, [sym]: 2 };
    expect(pick([sym], true)(obj)).toEqual({ [sym]: 2 });
  });
});

describe("omit", () => {
  it("omits specified keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });

  it("returns original object if no keys match", () => {
    expect(omit({ a: 1 }, ["b" as "a"])).toEqual({ a: 1 });
  });

  it("returns original object for empty keys array", () => {
    expect(omit({ a: 1 }, [])).toEqual({ a: 1 });
  });

  it("supports the data-last (curried) call form", () => {
    expect(omit(["b"])({ a: 1, b: 2, c: 3 })).toEqual({ a: 1, c: 3 });
  });

  it("supports symbol keys in the data-last (curried) call form", () => {
    const sym = Symbol("s");
    const obj = { a: 1, [sym]: 2 };
    expect(omit([sym], true)(obj)).toEqual({ a: 1 });
  });
});

describe("mapRecord", () => {
  it("maps entries to a new record", () => {
    const result = mapRecord({ a: 1, b: 2 }, ([k, v]) => [k, v * 2]);
    expect(result).toEqual({ a: 2, b: 4 });
  });

  it("can change keys and values", () => {
    const result = mapRecord({ a: 1 }, () => ["b" as const, 5]);
    expect(result).toEqual({ b: 5 });
  });

  it("returns empty record for empty input", () => {
    expect(mapRecord({}, ([k, v]) => [k, v])).toEqual({});
  });

  it("works with symbol keys when includeSymbols is true", () => {
    const sym = Symbol("s");
    const result = mapRecord(
      { a: 1, [sym]: 2 } as Record<string | symbol, number>,
      ([k, v]) => [String(k), v * 2],
      true
    );
    expect(result).toHaveProperty("a", 2);
  });
});
