/**
 * Build every practice before deploying any of them.
 *
 * One codebase serves every practitioner, which is the point: a fix or a new
 * feature reaches all of them at once. The risk that comes with it is that a
 * change which works for one practice can break another — most often because
 * new platform code reads a config field that only the tenant you were testing
 * happens to have.
 *
 * This builds each tenant in turn and reports which ones pass. Nothing is
 * deployed. Run it before shipping:
 *
 *   npm run build:all
 *
 * It also scans each tenant's rendered pages for the other tenants' identity,
 * so a value hard-coded into platform code instead of tenant content shows up
 * here rather than on a customer's live site.
 *
 * Exits non-zero if any tenant fails to build or shows a leak, so CI can gate
 * on it.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TENANTS_DIR = join(ROOT, "tenants");
const NEXT_OUT = join(ROOT, ".next", "server", "app");

/** Words that belong to exactly one practice and must never appear in another's pages. */
function identityTerms(tenantSlug) {
  const file = join(TENANTS_DIR, tenantSlug, "content.ts");
  if (!existsSync(file)) return [];
  const src = readFileSync(file, "utf8");
  const pick = (re) => {
    const m = src.match(re);
    return m ? m[1] : null;
  };
  return [
    pick(/\bshortName:\s*"([^"]+)"/),
    pick(/\bcontact:\s*\{[\s\S]*?email:\s*"([^"@]+)@/),
    pick(/\bnature:\s*\{[\s\S]*?homeLabel:\s*"([^",]+)/),
  ].filter((t) => t && t.trim().length > 3);
}

function listHtml(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) out.push(p);
    }
  };
  walk(dir);
  return out;
}

const tenants = existsSync(TENANTS_DIR)
  ? readdirSync(TENANTS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  : [];

if (!tenants.length) {
  console.error("No tenants found under tenants/.");
  process.exit(1);
}

console.log(`Building ${tenants.length} practice${tenants.length === 1 ? "" : "s"}: ${tenants.join(", ")}\n`);

const results = [];

for (const tenant of tenants) {
  process.stdout.write(`  ${tenant.padEnd(18)} building… `);
  // A stale .next from the previous tenant would let a build "succeed" on
  // someone else's pages, so clear it each time.
  rmSync(join(ROOT, ".next"), { recursive: true, force: true });

  let built = false;
  let error = "";
  try {
    execFileSync("npm", ["run", "build"], {
      env: { ...process.env, TENANT: tenant },
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    built = true;
  } catch (err) {
    const out = `${err.stdout || ""}${err.stderr || ""}`;
    error =
      out
        .split("\n")
        .filter((l) => /error|failed|cannot find|not found/i.test(l))
        .slice(0, 3)
        .join(" | ") || "build failed";
  }

  if (!built) {
    console.log("FAILED");
    results.push({ tenant, built: false, error, leaks: [] });
    continue;
  }

  const pages = listHtml(NEXT_OUT);
  const others = tenants.filter((t) => t !== tenant);
  const leaks = [];
  for (const other of others) {
    for (const term of identityTerms(other)) {
      const hits = pages.filter((p) => readFileSync(p, "utf8").toLowerCase().includes(term.toLowerCase()));
      if (hits.length) leaks.push(`"${term}" (${other}) in ${hits.length} page(s)`);
    }
  }

  console.log(`ok — ${pages.length} pages${leaks.length ? `, ${leaks.length} LEAK(S)` : ""}`);
  results.push({ tenant, built: true, error: "", leaks, pages: pages.length });
}

// Leave the working tree on the default tenant so a later `npm run dev` is
// not silently pointed at whichever practice happened to build last.
rmSync(join(ROOT, ".next"), { recursive: true, force: true });
execFileSync("node", ["scripts/select-tenant.mjs"], { stdio: "ignore" });

console.log("\n" + "-".repeat(56));
const failed = results.filter((r) => !r.built);
const leaking = results.filter((r) => r.built && r.leaks.length);

for (const r of failed) console.log(`  BUILD FAILED  ${r.tenant}: ${r.error}`);
for (const r of leaking) {
  console.log(`  LEAK          ${r.tenant}:`);
  for (const l of r.leaks) console.log(`                  ${l}`);
}

if (!failed.length && !leaking.length) {
  const total = results.reduce((n, r) => n + r.pages, 0);
  console.log(`  All ${results.length} practices build cleanly — ${total} pages, no identity leaked between them.`);
  console.log("  Safe to deploy.");
  process.exit(0);
}

console.log("\n  Do not deploy. Fix the above first.");
console.log("  A leak means a value is written into platform code instead of tenant content.");
process.exit(1);
