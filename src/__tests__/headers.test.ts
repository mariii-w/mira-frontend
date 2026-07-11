import { describe, expect, it } from "vitest";
import { createPageMeta } from "../lib/headers";

describe("createPageMeta", () => {
  it("builds a title tag and og:title from the title alone", () => {
    const result = createPageMeta({ title: "Browse Services" });

    expect(result.meta).toContainEqual({ title: "Browse Services – Mira" });
    expect(result.meta).toContainEqual({
      property: "og:title",
      content: "Browse Services – Mira",
    });
    expect(result.links).toEqual([]);
  });

  it("adds description and og:description when provided", () => {
    const result = createPageMeta({
      title: "Home",
      description: "Find local help.",
    });

    expect(result.meta).toContainEqual({
      name: "description",
      content: "Find local help.",
    });
    expect(result.meta).toContainEqual({
      property: "og:description",
      content: "Find local help.",
    });
  });

  it("omits description tags when none is given", () => {
    const result = createPageMeta({ title: "Home" });

    expect(result.meta.some((m) => "name" in m && m.name === "description")).toBe(false);
  });

  it("builds a canonical link and og:url from a path", () => {
    const result = createPageMeta({ title: "About", path: "/about" });

    expect(result.links).toEqual([
      { rel: "canonical", href: expect.stringContaining("/about") },
    ]);
    expect(result.meta).toContainEqual({
      property: "og:url",
      content: expect.stringContaining("/about"),
    });
  });

  it("prefers an explicit url over one derived from path", () => {
    const result = createPageMeta({
      title: "Listing",
      path: "/listings/1",
      url: "https://mira.example/listings/1",
    });

    expect(result.links).toEqual([
      { rel: "canonical", href: "https://mira.example/listings/1" },
    ]);
  });

  it("omits the canonical link and og:url when neither path nor url is given", () => {
    const result = createPageMeta({ title: "Home" });

    expect(result.links).toEqual([]);
    expect(result.meta.some((m) => "property" in m && m.property === "og:url")).toBe(false);
  });
});
