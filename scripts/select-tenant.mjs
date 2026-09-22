/**
 * Picks which business this build serves.
 *
 * One codebase, one deployment per practitioner. Each Vercel project sets
 * TENANT to a directory name under `tenants/`; this writes the tiny
 * `tenants/active.ts` that the rest of the app imports.
 *
 * Generated rather than aliased because Turbopack's resolveAlias only maps
 * package names, not path prefixes — and a real file resolves identically for
 * TypeScript, the test runner, Turbopack and webpack.
 *
 * Runs automatically before build, dev and test. To switch by hand:
 *   TENANT=willow-creek node scripts/select-tenant.mjs
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TENANTS_DIR = join(process.cwd(), "tenants");
const tenant = process.env.TENANT?.trim() || "iron-lion";

const available = existsSync(TENANTS_DIR)
  ? readdirSync(TENANTS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  : [];

if (!available.includes(tenant)) {
  console.error(
    `\nTENANT="${tenant}" does not exist.\n\n` +
      `Available tenants: ${available.join(", ") || "(none)"}\n` +
      `Each one is a directory under tenants/ holding that business's content.\n`,
  );
  process.exit(1);
}

const contentFile = join(TENANTS_DIR, tenant, "content.ts");
if (!existsSync(contentFile)) {
  console.error(`\nTenant "${tenant}" has no content.ts at ${contentFile}\n`);
  process.exit(1);
}

const body = `/**
 * GENERATED FILE — do not edit, and do not commit.
 * Written by scripts/select-tenant.mjs from the TENANT env var.
 *
 * Active tenant: ${tenant}
 */
export * from "./${tenant}/content";
`;

const target = join(TENANTS_DIR, "active.ts");
// Only write when it actually changed, so watch mode does not loop.
if (!existsSync(target) || readFileSync(target, "utf8") !== body) {
  writeFileSync(target, body);
}
console.log(`tenant: ${tenant}`);
