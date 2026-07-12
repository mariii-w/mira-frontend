import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentReturnPage } from "../components/features/payments/PaymentReturnPage";

describe("<PaymentReturnPage />", () => {
  it("shows the success state", () => {
    render(<PaymentReturnPage status="success" onBackToBookings={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Payment received" })).toBeInTheDocument();
    expect(screen.getByText(/your payment was submitted/i)).toBeInTheDocument();
  });

  it("shows the cancelled state", () => {
    render(<PaymentReturnPage status="cancelled" onBackToBookings={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Payment cancelled" })).toBeInTheDocument();
    expect(screen.getByText(/no payment was completed/i)).toBeInTheDocument();
  });

  it("calls onBackToBookings when the button is clicked", () => {
    const onBackToBookings = vi.fn();
    render(<PaymentReturnPage status="success" onBackToBookings={onBackToBookings} />);

    fireEvent.click(screen.getByRole("button", { name: "My bookings" }));

    expect(onBackToBookings).toHaveBeenCalledTimes(1);
  });
});
