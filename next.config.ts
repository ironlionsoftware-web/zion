import type { NextConfig } from "next";

/**
 * Which business this deployment serves is decided before the build by
 * scripts/select-tenant.mjs (see the `prebuild` script), which writes
 * tenants/active.ts from the TENANT env var. Nothing to configure here.
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  env: {
    NEXT_PUBLIC_TENANT: process.env.TENANT?.trim() || "iron-lion",
  },
};

export default nextConfig;
