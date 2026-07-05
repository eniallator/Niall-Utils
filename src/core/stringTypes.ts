import type { Increment } from "../math/maths.ts";

/** A single whitespace character. */
export type Whitespace = " " | "\t" | "\n" | "\r";
/** A single decimal digit character. */
export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
/** A single lowercase Latin letter character. */
export type AlphabetLower =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";
/** A single uppercase Latin letter character. */
export type AlphabetUpper = Uppercase<AlphabetLower>;
/** A single Latin letter character, either case. */
export type Alphabet = AlphabetLower | AlphabetUpper;

type Quantifier = number | "0+" | "1+";

/**
 * A single match token used by {@link MatchString} to describe what to match against a string.
 * @template Charset The union of characters that this token matches.
 * @template Q How many characters to match: an exact count, `"0+"` for zero-or-more, or `"1+"` for one-or-more.
 * @template Capture Whether the matched characters should be included in {@link MatchString}'s output.
 */
export interface Match<
  Charset extends string,
  Q extends Quantifier,
  Capture extends boolean,
> {
  charset: Charset;
  quantifier: Q;
  capture: Capture;
}

/** Any {@link Match} token, regardless of charset, quantifier, or capture flag. */
export type AnyMatch = Match<string, Quantifier, boolean>;

/**
 * A {@link Match} token whose matched characters are captured into {@link MatchString}'s output.
 * @template C The union of characters that this token matches.
 * @template Q How many characters to match. Defaults to `"0+"`.
 */
export type Capture<C extends string, Q extends Quantifier = "0+"> = Match<
  C,
  Q,
  true
>;
/**
 * A {@link Match} token whose matched characters are consumed but excluded from {@link MatchString}'s output.
 * @template C The union of characters that this token matches.
 * @template Q How many characters to match. Defaults to `"0+"`.
 */
export type Skip<C extends string, Q extends Quantifier = "0+"> = Match<
  C,
  Q,
  false
>;

/**
 * The error shape produced by {@link MatchString} when a string doesn't satisfy a {@link Match} token.
 * @template Reason Human-readable description of why matching failed.
 * @template Rest The remaining, unmatched portion of the string at the point of failure.
 * @template M The {@link Match} token that failed to match.
 */
export interface ParserError<
  Reason extends string,
  Rest extends string,
  M extends AnyMatch,
> {
  reason: Reason;
  failedAt: Rest extends "" ? "<END OF STRING>" : `"${Rest}"`;
  expected: { charset: M["charset"]; quantifier: M["quantifier"] };
}

interface ParserState {
  out: string;
  rest: string;
}

type CombineState<
  Current extends ParserState,
  Next extends ParserState | ParserError<string, string, AnyMatch>,
> = Next extends ParserState
  ? { out: `${Current["out"]}${Next["out"]}`; rest: Next["rest"] }
  : Next;

type ApplyMatch<
  Str extends string,
  M extends AnyMatch,
  Q extends Quantifier = M["quantifier"],
  Idx extends number = 0,
> = Idx extends Q
  ? { out: ""; rest: Str }
  : Str extends `${infer Head}${infer Tail}`
    ? Head extends M["charset"]
      ? CombineState<
          { out: M["capture"] extends true ? Head : ""; rest: Tail },
          ApplyMatch<Tail, M, Q, Increment<Idx>>
        >
      : Q extends "0+"
        ? { out: ""; rest: Str }
        : Q extends "1+"
          ? Idx extends 0
            ? ParserError<"Expected quantifier '1+' but found no match", Str, M>
            : { out: ""; rest: Str }
          : ParserError<`Expected exact match. Found: ${Idx} / ${Q}`, Str, M>
    : Q extends 0 | "0+"
      ? { out: ""; rest: "" }
      : Q extends "1+"
        ? Idx extends 0
          ? ParserError<"Expected at least one match for '1+'", "", M>
          : { out: ""; rest: "" }
        : ParserError<"Exact match count not be satisfied", "", M>;

type ParseTokens<
  Str extends string,
  Tokens extends AnyMatch[],
> = Tokens extends [infer Head, ...infer Tail]
  ? ApplyMatch<Str, Extract<Head, AnyMatch>> extends infer Result
    ? Result extends ParserState
      ? CombineState<
          Result,
          ParseTokens<Result["rest"], Extract<Tail, AnyMatch[]>>
        >
      : Result
    : never
  : { out: ""; rest: Str };

/**
 * Matches a string against a sequence of {@link Match} tokens, similar to a regex, and returns the concatenation
 * of all captured sections. Resolves to a {@link ParserError} if `Str` doesn't satisfy `Tokens`.
 * @template Str The string to match against.
 * @template Tokens The sequence of {@link Match} tokens to apply in order.
 */
export type MatchString<Str extends string, Tokens extends AnyMatch[]> =
  ParseTokens<Str, Tokens> extends infer Result
    ? Result extends ParserState
      ? Result["out"]
      : Result
    : never;

type StringChars<Str extends string> = Str extends `${infer Char}${infer Rest}`
  ? [Char, ...StringChars<Rest>]
  : [];

type StringSplitNonEmpty<
  Str extends string,
  Sep extends string,
  Parts extends string[] = [],
> = Str extends `${Sep}${infer Rest}`
  ? StringSplitNonEmpty<
      Rest,
      Sep,
      Parts extends [string, ...string[]] ? [...Parts, ""] : ["", ""]
    >
  : Str extends `${infer Char}${infer Rest}`
    ? StringSplitNonEmpty<
        Rest,
        Sep,
        Parts extends [...infer Head, infer Tail]
          ? [...Head, `${Extract<Tail, string>}${Char}`]
          : [Char]
      >
    : Parts;

/**
 * Splits a string type on a separator, similarly to `String.prototype.split`, producing a tuple of the parts.
 * @template Str The string to split.
 * @template Sep The separator to split on. When empty, splits into individual characters.
 */
export type StringSplit<Str extends string, Sep extends string> = Sep extends ""
  ? StringChars<Str>
  : StringSplitNonEmpty<Str, Sep>;
