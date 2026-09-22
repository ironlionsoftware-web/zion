import path from "node:path";
import type { NextConfig } from "next";

/**
 * Which tenant this deployment serves. One codebase, one deployment per
 * practitioner: each Vercel project sets TENANT to its own directory under
 * `tenants/`. Defaults to iron-lion so the original site is unaffected.
 */
const tenant = process.env.TENANT?.trim() || "iron-lion";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  env: {
    // Exposed so runtime code can report which tenant it is without re-reading
    // the build env (useful in error pages and admin diagnostics).
    NEXT_PUBLIC_TENANT: tenant,
  },
  turbopack: {
    resolveAlias: {
      "@/tenant": path.resolve(process.cwd(), "tenants", tenant),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/tenant": path.resolve(process.cwd(), "tenants", tenant),
    };
    return config;
  },
};

export default nextConfig;
