import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  RegisterRole,
  type RegisterRoleSubmitValues,
} from "../components/RegisterRole";
import source from "../components/RegisterRole.tsx?raw";

describe("RegisterRole", () => {
  it("renders the current role from props", () => {
    render(<RegisterRole currentUserType="CUSTOMER" onContinue={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "How will you use Mira?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /i need help/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: /i can help/i })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("submits the selected role through the continue handler", async () => {
    const onContinue = vi
      .fn<(values: RegisterRoleSubmitValues) => Promise<void>>()
      .mockResolvedValue(undefined);

    render(<RegisterRole currentUserType={null} onContinue={onContinue} />);

    fireEvent.click(screen.getByRole("radio", { name: /i can help/i }));

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledWith({ userType: "PROVIDER" });
    });
  });

  it("keeps fetching and route state out of the component", () => {
    expect(source).not.toMatch(/\buseQuery\b/);
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\buseNavigate\b/);
    expect(source).not.toMatch(/\buseAuthStore\b/);
    expect(source).not.toMatch(/\bget_access_token\b/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/from ["']\.\.\/api\/mira["']/);
    expect(source).not.toMatch(/from ["']\.\.\/lib\/patchUser["']/);
  });
});
