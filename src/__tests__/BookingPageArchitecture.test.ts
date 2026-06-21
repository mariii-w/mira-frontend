import { describe, expect, it } from "vitest";
import source from "../components/BookingPage.tsx?raw";
import bookingCardSource from "../components/BookingCard.tsx?raw";
import queryClientSource from "../lib/queryClient.ts?raw";
import bookingRouteSource from "../routes/listings/$listingId_.book.tsx?raw";

describe("booking page architecture", () => {
  it("keeps fetching out of the booking component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\bauthFetch\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
  });

  it("does not use the authFetch wrapper", () => {
    expect(queryClientSource).not.toMatch(/\bauthFetch\b/);
    expect(bookingCardSource).not.toMatch(/\bauthFetch\b/);
    expect(bookingRouteSource).not.toMatch(/\bauthFetch\b/);
  });

  it("keeps booking card network work in the route", () => {
    expect(bookingCardSource).not.toMatch(/\bfetch\s*\(/);
    expect(bookingCardSource).not.toMatch(/\bget_access_token\b/);
    expect(bookingCardSource).not.toMatch(/from ['"]\.\.\/api\/mira['"]/);
  });

  it("uses the generated API client from the booking route", () => {
    expect(bookingRouteSource).not.toMatch(/\bfetch\s*\(/);
    expect(bookingRouteSource).toMatch(/from ["']\.\.\/\.\.\/api\/mira["']/);
  });
});
