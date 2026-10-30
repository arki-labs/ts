/** `expectImportPure`: assert that importing modules from a bare environment observes nothing. Node only. */
import { spawnSync } from 'node:child_process';
const SENTINEL = 'ARKI_IMPORT_PURE';
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
export function expectImportPure(entryPaths, options = {}) {
    if (entryPaths.length === 0) {
        throw new Error('expectImportPure: no entry paths given — the assertion would be vacuous.');
    }
    const script = entryPaths.map(path => `await import(${JSON.stringify(path)});`).join(' ') +
        ` console.log(${JSON.stringify(SENTINEL)});`;
    const result = spawnSync(options.runtime ?? 'bun', ['-e', script], {
        env: {
            // The bare minimum for the runtime itself — nothing app-shaped.
            // eslint-disable-next-line turbo/no-undeclared-env-vars -- deliberately reading the host env to construct the scrubbed subprocess env
            PATH: process.env['PATH'] ?? '',
            // eslint-disable-next-line turbo/no-undeclared-env-vars -- same
            HOME: process.env['HOME'] ?? '',
            NODE_ENV: 'development',
            ...options.env,
        },
        encoding: 'utf8',
        timeout: options.timeoutMs ?? 60_000,
    });
    const detail = `\n--- stdout ---\n${result.stdout}\n--- stderr ---\n${result.stderr}`;
    if (result.error) {
        throw new Error(`expectImportPure: subprocess failed to run: ${result.error.message}${detail}`);
    }
    if (/error|Invalid environment/i.test(result.stderr)) {
        throw new Error(`expectImportPure: import observed the environment or threw.${detail}`);
    }
    if (!result.stdout.includes(SENTINEL) || result.status !== 0) {
        throw new Error(`expectImportPure: import did not complete cleanly (exit ${String(result.status)}).${detail}`);
    }
}
//# sourceMappingURL=testing.js.map