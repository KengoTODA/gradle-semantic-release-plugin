#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent || "";

if (userAgent.includes("pnpm/")) {
  process.exit(0);
}

console.error("This repository must be installed with pnpm.");
console.error("Run `corepack enable` once, then use `pnpm install`.");
process.exit(1);
