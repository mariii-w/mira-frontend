import { describe, expect, it } from "vitest";
import source from "../components/BookingPage.tsx?raw";

describe("booking page architecture", () => {
  it("keeps fetching out of the booking component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\bauthFetch\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
  });
});
