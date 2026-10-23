export type AppEnv = "development" | "staging" | "production";

const appEnvs: AppEnv[] = ["development", "staging", "production"];

export function parseAppEnv(value: string | undefined): AppEnv {
  return appEnvs.includes(value as AppEnv) ? (value as AppEnv) : "development";
}

// NEXT_PUBLIC_* must be referenced literally so Next can inline them at build time.
export const env = {
  appEnv: parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV),
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "AuditApp",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
};

export const isProduction = env.appEnv === "production";
