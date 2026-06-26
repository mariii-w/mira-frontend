import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegisterDone } from "../features/register/RegisterDone";
import type { PrivateUserProfileResponse } from "../api/model";
import source from "../features/register/RegisterDone.tsx?raw";

const user = {
  firstName: "Mira",
  lastName: "Example",
  profileMedia: {
    url: "https://example.com/photo.jpg",
  },
} as PrivateUserProfileResponse;

describe("RegisterDone", () => {
  it("renders the completed registration state from props", () => {
    render(<RegisterDone user={user} onFindServices={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "You're all set, Mira!" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Your profile photo")).toHaveAttribute(
      "src",
      "https://example.com/photo.jpg",
    );
  });

  it("calls the injected find services handler", () => {
    const onFindServices = vi.fn();

    render(<RegisterDone user={user} onFindServices={onFindServices} />);

    fireEvent.click(screen.getByRole("button", { name: /find services/i }));

    expect(onFindServices).toHaveBeenCalledOnce();
  });

  it("keeps fetching and route state out of the component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\buseAuthStore\b/);
    expect(source).not.toMatch(/\bget_access_token\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
  });
});
