import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InfoPage } from "../components/InfoPage";
import { INFO_PAGES } from "../components/infoPages";

vi.mock("../components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

describe("<InfoPage />", () => {
  it("renders the accessibility page principles and contact person", () => {
    render(<InfoPage page={INFO_PAGES.accessibility} />);

    expect(
      screen.getByRole("heading", { name: "Accessibility at Mira" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Accessibility is part of the way the project is built/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How Mira supports accessibility/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Easy Language")).toBeInTheDocument();
    expect(screen.getByText("Reduced Motion")).toBeInTheDocument();
    expect(screen.getByText("Image descriptions")).toBeInTheDocument();
    expect(screen.getByText("Accessibility panel")).toBeInTheDocument();
    expect(
      screen.getByText(/accessibility panel directly in the navigation bar/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /service descriptions and user bios can be shown in Easy Language/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/you can use Reduced Motion/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AI-supported alternative text descriptions/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "accessibility@mira.com" }),
    ).toHaveAttribute("href", "mailto:accessibility@mira.com");
    expect(
      screen
        .getByText("Accessibility panel")
        .compareDocumentPosition(screen.getByText("Easy Language")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("renders contact page content", () => {
    render(<InfoPage page={INFO_PAGES.contact} />);

    expect(
      screen.getByRole("heading", { name: "Contact Us" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Questions, feedback, and reports/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Helpful details to include/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "support@mira.com" }),
    ).toHaveAttribute("href", "mailto:support@mira.com");
  });

  it("renders the other footer page content", () => {
    const { rerender } = render(<InfoPage page={INFO_PAGES.about} />);

    expect(
      screen.getByRole("heading", { name: "About Mira" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Why trust matters/i)).toBeInTheDocument();

    rerender(<InfoPage page={INFO_PAGES.terms} />);
    expect(
      screen.getByRole("heading", { name: "Terms of Use" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Services and profiles/i)).toBeInTheDocument();
    expect(
      screen.getByText(/not a substitute for final legal terms/i),
    ).toBeInTheDocument();

    rerender(<InfoPage page={INFO_PAGES.privacy} />);
    expect(
      screen.getByRole("heading", { name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Information kept private/i)).toBeInTheDocument();
    expect(screen.queryByText(/Project status/i)).not.toBeInTheDocument();
  });
});
