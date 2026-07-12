import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  BookingCard,
  type BookingCardProps,
  type BookingDetails,
  type BookingSummary,
} from "../components/features/bookings/BookingCard";

function makeBooking(overrides: Partial<BookingSummary> = {}): BookingSummary {
  return {
    bookingId: "booking-1",
    listingId: "listing-1",
    listing: { title: "Grocery pickup" },
    counterparty: { userId: "user-2", name: "Anna", surname: "Muster" },
    status: "PENDING",
    serviceAddress: {
      street: "Main Street",
      houseNumber: "12",
      city: "Hof",
      postalCode: "95028",
    },
    totalPrice: 40,
    bookedStart: "2026-07-20T09:00:00.000Z",
    bookedEnd: "2026-07-20T11:00:00.000Z",
    createdAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeDetail(overrides: Partial<BookingDetails> = {}): BookingDetails {
  return {
    bookingId: "booking-1",
    listingId: "listing-1",
    listing: { title: "Grocery pickup" },
    consumer: { userId: "user-1", name: "Marija", surname: "V" },
    provider: { userId: "user-2", name: "Anna", surname: "Muster" },
    status: "PENDING",
    locationType: "AT_CONSUMER",
    serviceAddress: null,
    description: "Please pick up groceries from the list.",
    totalPrice: 40,
    bookedStart: "2026-07-20T09:00:00.000Z",
    bookedEnd: "2026-07-20T11:00:00.000Z",
    createdAt: "2026-06-01T10:00:00.000Z",
    confirmedAt: null,
    paidAt: null,
    providerCompletedAt: null,
    consumerConfirmedAt: null,
    consumerConfirmationType: null,
    autoConfirmAt: null,
    completedAt: null,
    cancelledAt: null,
    expiresAt: null,
    allowedActions: [
      { rel: "accept", href: "/bookings/booking-1/accept", method: "POST" },
    ],
    ...overrides,
  };
}

function makeProps(overrides: Partial<BookingCardProps> = {}): BookingCardProps {
  return {
    booking: makeBooking(),
    onActionComplete: vi.fn(),
    loadBookingDetails: vi.fn(),
    performBookingAction: vi.fn(),
    ...overrides,
  };
}

describe("<BookingCard /> summary", () => {
  it("renders the booking summary", () => {
    render(<BookingCard {...makeProps()} />);

    expect(screen.getByText("Grocery pickup")).toBeInTheDocument();
    expect(screen.getByText("Anna Muster")).toBeInTheDocument();
    expect(screen.getByText(/main street 12, hof/i)).toBeInTheDocument();
    expect(screen.getByText(/2h/)).toBeInTheDocument();
    expect(screen.getByLabelText("Booking status: Pending")).toBeInTheDocument();
  });

  it("hides the address line when there is no service address", () => {
    render(<BookingCard {...makeProps({ booking: makeBooking({ serviceAddress: null }) })} />);
    expect(screen.queryByText(/main street/i)).not.toBeInTheDocument();
  });

  it("starts collapsed with details not rendered", () => {
    render(<BookingCard {...makeProps()} />);
    expect(
      screen.getByRole("button", { name: "Expand booking details" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Please pick up groceries from the list.")).not.toBeInTheDocument();
  });
});

describe("<BookingCard /> expanding details", () => {
  it("loads details on first expand and renders them", async () => {
    const loadBookingDetails = vi.fn().mockResolvedValue(makeDetail());
    render(<BookingCard {...makeProps({ loadBookingDetails })} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand booking details" }));

    expect(loadBookingDetails).toHaveBeenCalledWith("booking-1");
    await waitFor(() =>
      expect(screen.getByText("Please pick up groceries from the list.")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Collapse booking details" }),
    ).toBeInTheDocument();
  });

  it("uses mockDetail directly without calling loadBookingDetails", () => {
    const loadBookingDetails = vi.fn();
    render(
      <BookingCard
        {...makeProps({ loadBookingDetails, mockDetail: makeDetail() })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand booking details" }));

    expect(loadBookingDetails).not.toHaveBeenCalled();
    expect(screen.getByText("Please pick up groceries from the list.")).toBeInTheDocument();
  });
});

describe("<BookingCard /> actions", () => {
  it("runs a booking action and refreshes details on success", async () => {
    const detail = makeDetail();
    const loadBookingDetails = vi.fn().mockResolvedValue(detail);
    const performBookingAction = vi.fn().mockResolvedValue(null);
    const onActionComplete = vi.fn();
    render(
      <BookingCard
        {...makeProps({ loadBookingDetails, performBookingAction, onActionComplete })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand booking details" }));
    await waitFor(() => expect(screen.getByText("Accept Booking")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Accept Booking"));

    await waitFor(() =>
      expect(performBookingAction).toHaveBeenCalledWith("booking-1", detail.allowedActions[0]),
    );
    await waitFor(() => expect(onActionComplete).toHaveBeenCalledTimes(1));
    expect(loadBookingDetails).toHaveBeenCalledTimes(2);
  });

  it("shows an error and does not call onActionComplete when the action fails", async () => {
    const loadBookingDetails = vi.fn().mockResolvedValue(makeDetail());
    const performBookingAction = vi.fn().mockResolvedValue("Booking was already accepted.");
    const onActionComplete = vi.fn();
    render(
      <BookingCard
        {...makeProps({ loadBookingDetails, performBookingAction, onActionComplete })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand booking details" }));
    await waitFor(() => expect(screen.getByText("Accept Booking")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Accept Booking"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Booking was already accepted."),
    );
    expect(onActionComplete).not.toHaveBeenCalled();
  });

  it("renders the cancel action separately from other actions", async () => {
    const detail = makeDetail({
      allowedActions: [
        { rel: "accept", href: "/bookings/booking-1/accept", method: "POST" },
        { rel: "cancel", href: "/bookings/booking-1/cancel", method: "POST" },
      ],
    });
    render(<BookingCard {...makeProps({ mockDetail: detail })} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand booking details" }));

    expect(screen.getByText("Accept Booking")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });
});
