/**
 * Start the dev server for a given practice.
 *
 *   npm run dev                    -> iron-lion on :3000
 *   node scripts/dev.mjs willow-creek 3001
 *
 * Exists because setting TENANT= inline works in bash but not in PowerShell
 * or cmd, and `npm run dev` would re-run the selector with the default.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const tenant = process.argv[2] || process.env.TENANT || "iron-lion";
const port = process.argv[3] || "3000";
const env = { ...process.env, TENANT: tenant };

const select = spawn(process.execPath, ["scripts/select-tenant.mjs"], { env, stdio: "inherit" });
select.on("exit", (code) => {
  if (code !== 0) process.exit(code ?? 1);
  // Call Next's own entry with node rather than going through a shell, so a
  // space in the project path (e.g. "software vibes") cannot break the command.
  const nextBin = require.resolve("next/dist/bin/next");
  const next = spawn(process.execPath, [nextBin, "dev", "-p", port], {
    env,
    stdio: "inherit",
  });
  next.on("exit", (c) => process.exit(c ?? 0));
});
