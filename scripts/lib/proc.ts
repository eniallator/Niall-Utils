import {
  spawnSync,
  type SpawnSyncOptions,
  type SpawnSyncReturns,
} from "node:child_process";
import { platform } from "node:os";

export type ProcOptions = Omit<SpawnSyncOptions, "encoding" | "stdio">;

type Spawn<Output extends string | Buffer> = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions
) => SpawnSyncReturns<Output>;

const isWindows = platform() === "win32";

const quoteForCmd = (arg: string) =>
  /[\s"^&|<>()%!]/.test(arg) ? `"${arg.replaceAll('"', '""')}"` : arg;

// Windows CLI shims (pnpm, npm, corepack, ...) are .cmd/.bat files, which
// Node refuses to spawn without a shell. Pre-quote everything into one
// command string so the shell isn't asked to re-parse an unescaped args
// array (Node warns/deprecates passing shell:true with a separate args array).
const toSpawnArgs = (
  command: string,
  args: readonly string[]
): [command: string, args: readonly string[]] =>
  isWindows
    ? [[command, ...args].map(quoteForCmd).join(" "), []]
    : [command, args];

const spawnOrThrow = <Output extends string | Buffer>(
  spawnFn: Spawn<Output>,
  command: string,
  args: readonly string[],
  options: ProcOptions
): SpawnSyncReturns<Output> => {
  const [resolvedCommand, resolvedArgs] = toSpawnArgs(command, args);
  const result = spawnFn(resolvedCommand, resolvedArgs, {
    shell: isWindows,
    ...options,
  });
  if (result.error != null) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with code ${result.status}\n${result.stderr ?? ""}`
    );
  }
  return result;
};

export const run = (
  command: string,
  args: readonly string[],
  options: ProcOptions = {}
): string =>
  spawnOrThrow(
    (c, a, o) => spawnSync(c, a, { ...o, encoding: "utf8" }),
    command,
    args,
    options
  ).stdout;

export const runInherit = (
  command: string,
  args: readonly string[],
  options: ProcOptions = {}
): void => {
  spawnOrThrow(
    (c, a, o) => spawnSync(c, a, { ...o, stdio: "inherit" }),
    command,
    args,
    options
  );
};
