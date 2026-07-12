import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccessibilityPanel } from "../components/common/layout/AccessibilityPanel";
import { useAccessibilityStore } from "../stores/accessibility";

afterEach(() => {
  useAccessibilityStore.setState({ easyRead: false, reducedMotion: false });
});

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "Accessibility settings" }));
}

describe("<AccessibilityPanel />", () => {
  it("keeps the settings closed until the trigger is clicked", () => {
    render(<AccessibilityPanel />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows both toggles once opened, reflecting the current store state", () => {
    render(<AccessibilityPanel />);
    openPanel();

    const easyRead = screen.getByRole("switch", { name: "Easy language" });
    const reducedMotion = screen.getByRole("switch", { name: "Reduce motion" });
    expect(easyRead).toHaveAttribute("aria-checked", "false");
    expect(reducedMotion).toHaveAttribute("aria-checked", "false");
  });

  it("toggles easy read in the store without affecting reduced motion", () => {
    render(<AccessibilityPanel />);
    openPanel();

    fireEvent.click(screen.getByRole("switch", { name: "Easy language" }));

    expect(useAccessibilityStore.getState()).toMatchObject({
      easyRead: true,
      reducedMotion: false,
    });
    expect(screen.getByRole("switch", { name: "Easy language" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("toggles reduced motion in the store without affecting easy read", () => {
    render(<AccessibilityPanel />);
    openPanel();

    fireEvent.click(screen.getByRole("switch", { name: "Reduce motion" }));

    expect(useAccessibilityStore.getState()).toMatchObject({
      easyRead: false,
      reducedMotion: true,
    });
  });

  it("reflects a pre-existing store state when opened", () => {
    useAccessibilityStore.setState({ easyRead: true, reducedMotion: false });
    render(<AccessibilityPanel />);
    openPanel();

    expect(screen.getByRole("switch", { name: "Easy language" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
