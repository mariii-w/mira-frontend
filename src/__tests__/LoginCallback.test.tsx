import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginCallback } from "../components/features/auth/LoginCallback";

describe("<LoginCallback />", () => {
  it("renders nothing when there is no error", () => {
    const { container } = render(<LoginCallback retryHref="/login" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an unrelated error code", () => {
    const { container } = render(
      <LoginCallback error="some_other_error" retryHref="/login" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the failure message and a retry link for oauth2_failed", () => {
    render(<LoginCallback error="oauth2_failed" retryHref="/login?method=google" />);

    expect(screen.getByRole("heading", { name: "Login failed" })).toBeInTheDocument();
    expect(
      screen.getByText(/something went wrong signing you in with google/i),
    ).toBeInTheDocument();

    const retryLink = screen.getByRole("link", { name: /try again with google/i });
    expect(retryLink).toHaveAttribute("href", "/login?method=google");
  });
});
