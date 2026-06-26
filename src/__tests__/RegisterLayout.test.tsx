import { describe, expect, it } from "vitest";
import source from "../components/features/register/RegisterLayout.tsx?raw";

describe("RegisterLayout", () => {
  it("keeps fetching and route state out of the component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\buseLocation\b/);
    expect(source).not.toMatch(/\bOutlet\b/);
    expect(source).not.toMatch(/\buseAuthStore\b/);
    expect(source).not.toMatch(/\bget_access_token\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/from ["']\.\.\/api\/mira["']/);
  });
});
