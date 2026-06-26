import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InfoPage } from "../components/common/InfoPage";
import { INFO_PAGES } from "../components/common/infoPages";

describe("<InfoPage />", () => {
  it("renders the accessibility page principles and contact person", () => {
    render(<InfoPage page={INFO_PAGES.accessibility} />);

    expect(
      screen.getByRole("heading", { name: "Accessibility Statement for Mira" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mira is designed to be accessible and usable/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Current accessibility status" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Easy Language")).toBeInTheDocument();
    expect(screen.getByText("Reduced Motion")).toBeInTheDocument();
    expect(screen.getByText("Image descriptions")).toBeInTheDocument();
    expect(screen.getByText("Accessibility panel")).toBeInTheDocument();
    expect(
      screen.getByText(/accessibility panel in the navigation bar/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Some service descriptions and user biographies can be displayed in Easy Language/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Mira includes a Reduced Motion setting/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI-supported alternative text descriptions/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Known accessibility limitations" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Feedback and contact" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This accessibility statement was last updated on 26 June 2026.",
      ),
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
