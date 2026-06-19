import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegisterPhoto } from "../components/RegisterPhoto";
import type { PrivateUserProfileResponse } from "../api/model";
import source from "../components/RegisterPhoto.tsx?raw";

const user = {
  firstName: "Mira",
  lastName: "Example",
  profileMedia: {
    url: "https://example.com/photo.jpg",
  },
} as PrivateUserProfileResponse;

describe("RegisterPhoto", () => {
  it("renders the photo form from props", () => {
    render(
      <RegisterPhoto
        initialValues={user}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Add a profile photo" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Profile preview")).toHaveAttribute(
      "src",
      "https://example.com/photo.jpg",
    );
  });

  it("calls the injected back handler", () => {
    const onBack = vi.fn();

    render(
      <RegisterPhoto
        initialValues={user}
        onBack={onBack}
        onContinue={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("calls the injected continue handler with the selected file", async () => {
    const onContinue = vi.fn().mockResolvedValue(undefined);
    const file = new File(["profile"], "profile.png", { type: "image/png" });

    render(
      <RegisterPhoto
        initialValues={user}
        onBack={vi.fn()}
        onContinue={onContinue}
      />,
    );

    fireEvent.change(screen.getByLabelText("Choose photo"), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: /finish/i }));

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledWith(file);
    });
  });

  it("keeps fetching and route state out of the component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\buseAuthStore\b/);
    expect(source).not.toMatch(/\bget_access_token\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/from ["']\.\.\/api\/mira["']/);
  });
});
