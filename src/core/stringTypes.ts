import type { Increment } from "../math/maths.ts";

export type Whitespace = " " | "\t" | "\n" | "\r";
export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
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
export type AlphabetUpper = Uppercase<AlphabetLower>;
export type Alphabet = AlphabetLower | AlphabetUpper;

type Quantifier = number | "0+" | "1+";

export interface Match<
  Charset extends string,
  Q extends Quantifier,
  Capture extends boolean,
> {
  charset: Charset;
  quantifier: Q;
  capture: Capture;
}

export type AnyMatch = Match<string, Quantifier, boolean>;

export type Capture<C extends string, Q extends Quantifier = "0+"> = Match<
  C,
  Q,
  true
>;
export type Skip<C extends string, Q extends Quantifier = "0+"> = Match<
  C,
  Q,
  false
>;

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

export type StringSplit<Str extends string, Sep extends string> = Sep extends ""
  ? StringChars<Str>
  : StringSplitNonEmpty<Str, Sep>;
