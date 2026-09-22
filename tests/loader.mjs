/**
 * Module loader for the test suite.
 *
 * Three jobs Next.js normally does for us:
 *  - resolve the `@/` path alias from `tsconfig.json`
 *  - resolve `@/tenant`, which next.config.ts aliases to the tenant directory
 *    named by the TENANT env var (defaults to iron-lion)
 *  - add the file extension that TypeScript source omits
 *
 * It also stubs `next/headers`, which only exists inside a Next request and is not needed by any
 * of the pure logic under test.
 *
 * Used via `node --import ./tests/loader.mjs --test`. See the `test` script in package.json.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = pathToFileURL(process.cwd() + "/").href;
// Mirrors the `@/tenant` alias in next.config.ts so tests exercise the same
// tenant the build would. Set TENANT to run the suite against another tenant.
const TENANT = process.env.TENANT?.trim() || "iron-lion";
const TENANT_ROOT = pathToFileURL(process.cwd() + "/tenants/" + TENANT + "/").href;

register(
  "data:text/javascript," +
    encodeURIComponent(`
  import { existsSync } from 'node:fs';
  import { fileURLToPath } from 'node:url';

  function withExtension(url) {
    if (/\\.[a-z]+$/.test(url)) return url;
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      if (existsSync(fileURLToPath(url + ext))) return url + ext;
    }
    return url;
  }

  export async function resolve(specifier, context, next) {
    if (specifier === 'next/headers') {
      return {
        url: 'data:text/javascript,export const cookies = async () => ({ get: () => undefined });',
        shortCircuit: true,
      };
    }
    // Node's ESM resolver does not apply Next's own subpath exports, so 'next/server' has to be
    // asked for by filename. Next resolves either form.
    if (/^next\\/[a-z-]+$/.test(specifier)) {
      try {
        return await next(specifier + '.js', context);
      } catch {
        return next(specifier, context);
      }
    }
    if (specifier === '@/tenant' || specifier.startsWith('@/tenant/')) {
      const rest = specifier === '@/tenant' ? 'index' : specifier.slice('@/tenant/'.length);
      return next(withExtension(new URL(rest, '${TENANT_ROOT}').href), context);
    }
    if (specifier.startsWith('@/')) {
      return next(withExtension(new URL(specifier.slice(2), '${ROOT}').href), context);
    }
    if (specifier.startsWith('./') || specifier.startsWith('../')) {
      return next(withExtension(new URL(specifier, context.parentURL).href), context);
    }
    return next(specifier, context);
  }
`),
  import.meta.url,
);
