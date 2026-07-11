import "@testing-library/jest-dom/vitest";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MyBookings } from "../components/features/bookings/MyBookings";

type MyBookingsProps = ComponentProps<typeof MyBookings>;
type BookingSummary = MyBookingsProps["bookings"][number];

function makeBooking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    bookingId: "booking-1",
    listingId: "listing-1",
    listing: { title: "Grocery pickup" },
    counterparty: { userId: "user-2", name: "Anna", surname: "Muster" },
    status: "PENDING",
    serviceAddress: null,
    totalPrice: 40,
    bookedStart: "2026-07-20T09:00:00.000Z",
    bookedEnd: "2026-07-20T11:00:00.000Z",
    createdAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeProps(overrides: Partial<MyBookingsProps> = {}): MyBookingsProps {
  return {
    bookings: [makeBooking()],
    isProvider: false,
    loading: false,
    error: null,
    onActionComplete: vi.fn(),
    loadBookingDetails: vi.fn(),
    performBookingAction: vi.fn(),
    ...overrides,
  };
}

describe("<MyBookings /> states", () => {
  it("shows a loading state", () => {
    render(<MyBookings {...makeProps({ loading: true, bookings: [] })} />);
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });

  it("shows an error state", () => {
    render(
      <MyBookings {...makeProps({ error: "Could not load bookings.", bookings: [] })} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load bookings.");
  });

  it("shows an empty state when there are no bookings", () => {
    render(<MyBookings {...makeProps({ bookings: [] })} />);
    expect(screen.getByText("No bookings yet.")).toBeInTheDocument();
  });

  it("renders one booking card per booking", () => {
    render(
      <MyBookings
        {...makeProps({
          bookings: [
            makeBooking({ bookingId: "booking-1", listing: { title: "Grocery pickup" } }),
            makeBooking({ bookingId: "booking-2", listing: { title: "Dog walking" } }),
          ],
        })}
      />,
    );
    expect(screen.getByText("Grocery pickup")).toBeInTheDocument();
    expect(screen.getByText("Dog walking")).toBeInTheDocument();
  });
});

describe("<MyBookings /> heading by role", () => {
  it("shows consumer-facing heading by default", () => {
    render(<MyBookings {...makeProps({ isProvider: false })} />);
    expect(screen.getByRole("heading", { name: "My Bookings" })).toBeInTheDocument();
  });

  it("shows provider-facing heading when isProvider is true", () => {
    render(<MyBookings {...makeProps({ isProvider: true })} />);
    expect(screen.getByRole("heading", { name: "Bookings received" })).toBeInTheDocument();
  });
});

describe("<MyBookings /> filtering", () => {
  it("filters bookings when a filter pill is clicked", () => {
    render(
      <MyBookings
        {...makeProps({
          isProvider: false,
          bookings: [
            makeBooking({
              bookingId: "booking-1",
              status: "PENDING",
              listing: { title: "Grocery pickup" },
            }),
            makeBooking({
              bookingId: "booking-2",
              status: "COMPLETED",
              listing: { title: "Dog walking" },
            }),
          ],
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pending" }));

    expect(screen.getByText("Grocery pickup")).toBeInTheDocument();
    expect(screen.queryByText("Dog walking")).not.toBeInTheDocument();
  });

  it("shows filter-specific empty text when a filter has no matches", () => {
    render(
      <MyBookings
        {...makeProps({
          isProvider: false,
          bookings: [
            makeBooking({
              bookingId: "booking-1",
              status: "COMPLETED",
              listing: { title: "Dog walking" },
            }),
          ],
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pending" }));

    expect(screen.getByText("No requests bookings.")).toBeInTheDocument();
  });
});
