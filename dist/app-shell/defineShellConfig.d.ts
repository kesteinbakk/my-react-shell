/**
 * defineShellConfig — builder + validator for the shell config.
 *
 * Validates the author-facing input synchronously (throwing `ShellConfigError`
 * at module-load time, when the consumer imports its shell config) and returns a
 * frozen, branded `ShellConfig`. The brand is defense in depth: a re-import or
 * dynamic factory can forge a raw object that satisfies the structural type, so
 * `<AppShell>` re-checks the symbol at runtime.
 */
import type { ShellConfig, ShellConfigInput } from './shellContract';
export declare class ShellConfigError extends Error {
    constructor(message: string);
}
export declare function defineShellConfig(input: ShellConfigInput): ShellConfig;
