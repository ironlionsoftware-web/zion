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
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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

const cssBody = `/* GENERATED FILE - do not edit, and do not commit.
   Written by scripts/select-tenant.mjs. Active tenant: ${tenant} */
@import "./${tenant}/theme.css";
`;
const cssTarget = join(TENANTS_DIR, "active.css");
if (!existsSync(cssTarget) || readFileSync(cssTarget, "utf8") !== cssBody) {
  writeFileSync(cssTarget, cssBody);
}

const target = join(TENANTS_DIR, "active.ts");
// Only write when it actually changed, so watch mode does not loop.
if (!existsSync(target) || readFileSync(target, "utf8") !== body) {
  writeFileSync(target, body);
}
// A tenant may ship its own images under tenants/<slug>/public. They are
// copied over public/ so the site serves them at the paths its content
// references. Iron Lion's own photography still lives in public/ directly.
const tenantPublic = join(TENANTS_DIR, tenant, "public");
if (existsSync(tenantPublic)) {
  cpSync(tenantPublic, join(process.cwd(), "public"), { recursive: true });
}

console.log(`tenant: ${tenant}`);
