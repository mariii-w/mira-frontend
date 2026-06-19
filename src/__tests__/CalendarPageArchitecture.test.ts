import { describe, expect, it } from "vitest";
import source from "../components/CalendarPage.tsx?raw";
import routeSource from "../routes/calendar.tsx?raw";

describe("calendar page architecture", () => {
  it("keeps fetching and auth out of the calendar component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bget_access_token\b/);
    expect(source).not.toMatch(/from ['"]\.\.\/api\/mira['"]/);
    expect(source).not.toMatch(/from ['"]\.\.\/stores\/auth['"]/);
  });

  it("keeps generated API glue in the route", () => {
    expect(routeSource).not.toMatch(/\bfetch\s*\(/);
    expect(routeSource).toMatch(/from ['"]\.\.\/api\/mira['"]/);
    expect(routeSource).toMatch(/\bget_access_token\b/);
  });
});
