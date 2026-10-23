#!/usr/bin/env node
// Runs a Next.js command against a named environment (e.g. "staging").
//
//   node scripts/run-next.mjs <environment> <next command> [...args]
//   node scripts/run-next.mjs staging build
//
// Next.js only knows "development" and "production". To support other
// environments we load .env.<environment>.local and .env.<environment> into
// process.env *before* Next starts. Next never overrides variables that are
// already set, so these values win over .env.production / .env.development.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const [environment, ...nextArgs] = process.argv.slice(2);

if (!environment || nextArgs.length === 0) {
  console.error("Usage: node scripts/run-next.mjs <environment> <next command> [...args]");
  process.exit(1);
}

const envFile = `.env.${environment}`;
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile}. Create it (see .env.example) before running.`);
  process.exit(1);
}

// Load .local first: loadEnvFile does not overwrite variables that are already
// set, so the first file loaded wins.
for (const file of [`.env.${environment}.local`, envFile]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
process.env.NEXT_PUBLIC_APP_ENV ??= environment;

console.log(`> Next.js "${nextArgs.join(" ")}" with environment: ${process.env.NEXT_PUBLIC_APP_ENV}`);

const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, ...nextArgs], { stdio: "inherit", env: process.env });

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
