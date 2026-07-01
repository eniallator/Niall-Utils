import { describe, expect, it } from "vitest";

import { pipeable, simplePipeable } from "./pipeable.ts";

// ============================================================================
// simplePipeable — no generics needed
// ============================================================================

// 1. simplePipeable without isDataFirst (default length check)
const addDefault = simplePipeable((a: number, b: number) => a + b);

// 2. simplePipeable with custom isDataFirst (optional params — default doesn't work)
const repeatCustom = simplePipeable(
  (str: string, times: number, sep?: string) =>
    Array(times)
      .fill(str)
      .join(sep ?? ""),
  ([first]) => typeof first === "string"
);

// ============================================================================
// pipeable with explicit overloads — same-type args or optional params
// ============================================================================

// 3. pipeable without isDataFirst (default length check works for fixed-arity)
const greetDefault = pipeable<{
  (name: string, greeting: string): string;
  (greeting: string): (name: string) => string;
}>((name, greeting) => `${greeting}, ${name}!`);

// 4. pipeable with custom isDataFirst (optional params — default doesn't work)
const typedKeys = pipeable<{
  <O extends object>(obj: O, includeSymbols?: boolean): (keyof O)[];
  (includeSymbols?: boolean): <O extends object>(obj: O) => (keyof O)[];
}>(
  <O extends object>(obj: O, includeSymbols?: boolean): (keyof O)[] =>
    includeSymbols
      ? (Object.getOwnPropertyNames(obj) as (keyof O)[])
      : (Object.getOwnPropertyNames(obj) as (keyof O)[]),
  ([first]) => typeof first === "object"
);

// ============================================================================
// Tests
// ============================================================================

describe("simplePipeable", () => {
  describe("without isDataFirst — default length check", () => {
    it("data-first when args.length === fn.length", () => {
      expect(addDefault(10, 5)).toBe(15);
    });

    it("curried when args.length !== fn.length", () => {
      const addFive = addDefault(5);
      expect(typeof addFive).toBe("function");
      expect(addFive(10)).toBe(15);
    });
  });

  describe("with custom isDataFirst — optional params", () => {
    it("data-first when first arg is the data type (string)", () => {
      expect(repeatCustom("x", 3)).toBe("xxx");
      expect(repeatCustom("ab", 2, "-")).toBe("ab-ab");
    });

    it("curried when first arg is not the data type (number)", () => {
      const repeatThree = repeatCustom(3);
      expect(typeof repeatThree).toBe("function");
      expect(repeatThree("x")).toBe("xxx");
    });
  });
});

describe("pipeable", () => {
  describe("without isDataFirst — default length check", () => {
    it("data-first when args.length === fn.length", () => {
      expect(greetDefault("Alice", "Hello")).toBe("Hello, Alice!");
    });

    it("curried when args.length !== fn.length", () => {
      const sayHello = greetDefault("Hello");
      expect(typeof sayHello).toBe("function");
      expect(sayHello("Bob")).toBe("Hello, Bob!");
    });
  });

  describe("with custom isDataFirst — optional params with generics", () => {
    it("data-first when first arg is an object", () => {
      const keys = typedKeys({ a: 1, b: 2 });
      expect(keys).toContain("a");
      expect(keys).toContain("b");
    });

    it("curried when first arg is boolean (includeSymbols)", () => {
      const getKeys = typedKeys(true);
      expect(typeof getKeys).toBe("function");
      expect(getKeys({ x: 10 })).toEqual(["x"]);
    });

    it("data-first with includeSymbols=true", () => {
      const obj = { a: 1, b: 2 };
      const keys = typedKeys(obj, true);
      expect(keys).toContain("a");
      expect(keys).toContain("b");
    });
  });
});
