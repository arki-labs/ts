/** Options for {@link expectImportPure}. */
export type ImportPurityOptions = {
    /** Subprocess runtime binary (default `'bun'`). */
    readonly runtime?: string;
    /** Kill the subprocess after this long (default 60s). */
    readonly timeoutMs?: number;
    /**
     * Extra environment variables for the subprocess, merged over the scrubbed
     * base. Use sparingly — every var added here is a purity exemption.
     */
    readonly env?: Readonly<Record<string, string>>;
};
/**
 * Assert the composition doctrine's import-purity contract: importing the
 * given modules must succeed from a bare checkout with a scrubbed
 * environment (only `PATH`/`HOME` for the runtime itself).
 *
 * `NODE_ENV=development` is set deliberately — env validation is NOT
 * skipped in development, so laziness (not a skip flag) is what must make
 * the import pass. Any module-scope observation anywhere in the import
 * chain (an eager `createEnv`, a connection ping, a `process.exit`) fails
 * loudly with the subprocess output attached.
 *
 * Framework-agnostic: throws on violation, so it fails the test under any
 * runner. Typical use, from a vitest file:
 *
 * ```ts
 * it('imports the full library surface with an empty environment', () => {
 *   expectImportPure(['../api.ts', '../db.ts'].map(p => fileURLToPath(new URL(p, import.meta.url))));
 * });
 * ```
 */
export declare function expectImportPure(entryPaths: readonly string[], options?: ImportPurityOptions): void;
//# sourceMappingURL=testing.d.ts.map