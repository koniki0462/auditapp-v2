import { describe, expect, it } from "vitest";
import { parseAppEnv } from "./env";

describe("parseAppEnv", () => {
  it("accepts known environments", () => {
    expect(parseAppEnv("staging")).toBe("staging");
    expect(parseAppEnv("production")).toBe("production");
  });

  it("falls back to development for missing or unknown values", () => {
    expect(parseAppEnv(undefined)).toBe("development");
    expect(parseAppEnv("qa")).toBe("development");
  });
});
