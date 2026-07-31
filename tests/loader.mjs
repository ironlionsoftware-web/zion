/**
 * Module loader for the test suite.
 *
 * Two jobs Next.js normally does for us:
 *  - resolve the `@/` path alias from `tsconfig.json`
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
