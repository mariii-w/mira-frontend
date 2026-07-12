import { afterEach, describe, expect, it, vi } from "vitest";
import { executeBookingAction, type BookingAction } from "../lib/bookingActions";
import {
  acceptBooking,
  acknowledgeDelivery,
  cancelBooking,
  createCheckoutSession,
  markDelivered,
  refuseBooking,
} from "../api/mira";

vi.mock("../api/mira", () => ({
  acceptBooking: vi.fn(),
  acknowledgeDelivery: vi.fn(),
  cancelBooking: vi.fn(),
  createCheckoutSession: vi.fn(),
  markDelivered: vi.fn(),
  refuseBooking: vi.fn(),
}));

const mockedAccept = vi.mocked(acceptBooking);
const mockedAcknowledge = vi.mocked(acknowledgeDelivery);
const mockedCancel = vi.mocked(cancelBooking);
const mockedCheckout = vi.mocked(createCheckoutSession);
const mockedMarkDelivered = vi.mocked(markDelivered);
const mockedRefuse = vi.mocked(refuseBooking);

function makeAction(rel: string): BookingAction {
  return { rel, href: `/bookings/booking-1/${rel}`, method: "POST" };
}

function makeProblem(status: number, detail: string) {
  return {
    type: "about:blank",
    title: "Error",
    status,
    detail,
    instance: "",
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("executeBookingAction: pay", () => {
  it("hands off to the redirect callback on a successful checkout", async () => {
    mockedCheckout.mockResolvedValue({
      status: 200,
      data: { checkoutUrl: "https://checkout.stripe.com/abc" },
      headers: new Headers(),
    } as Awaited<ReturnType<typeof createCheckoutSession>>);
    const redirectToCheckout = vi.fn();

    const error = await executeBookingAction(
      "booking-1",
      makeAction("pay"),
      redirectToCheckout,
    );

    expect(error).toBeNull();
    expect(redirectToCheckout).toHaveBeenCalledWith(
      "https://checkout.stripe.com/abc",
    );
  });

  it("surfaces the problem detail when checkout can't be started", async () => {
    mockedCheckout.mockResolvedValue({
      status: 409,
      data: makeProblem(409, "Booking is not payable."),
      headers: new Headers(),
    } as Awaited<ReturnType<typeof createCheckoutSession>>);

    const error = await executeBookingAction("booking-1", makeAction("pay"), vi.fn());

    expect(error).toBe("Booking is not payable.");
  });

  it("falls back to a generic message when checkout succeeds without a URL", async () => {
    mockedCheckout.mockResolvedValue({
      status: 200,
      data: {},
      headers: new Headers(),
    } as Awaited<ReturnType<typeof createCheckoutSession>>);

    const error = await executeBookingAction("booking-1", makeAction("pay"), vi.fn());

    expect(error).toBe("Payment checkout could not be started.");
  });
});

describe("executeBookingAction: status transitions", () => {
  it.each([
    ["cancel", mockedCancel] as const,
    ["accept", mockedAccept] as const,
    ["refuse", mockedRefuse] as const,
    ["mark-delivered", mockedMarkDelivered] as const,
    ["acknowledge-delivery", mockedAcknowledge] as const,
  ])("calls the matching endpoint for a %s action and returns null on success", async (rel, mockedFn) => {
    mockedFn.mockResolvedValue({
      status: 200,
      data: {},
      headers: new Headers(),
    } as Awaited<ReturnType<typeof mockedFn>>);

    const error = await executeBookingAction("booking-1", makeAction(rel), vi.fn());

    expect(error).toBeNull();
    expect(mockedFn).toHaveBeenCalledWith("booking-1");
  });

  it("surfaces the problem detail when an action is rejected", async () => {
    mockedAccept.mockResolvedValue({
      status: 409,
      data: makeProblem(409, "Booking was already accepted."),
      headers: new Headers(),
    } as Awaited<ReturnType<typeof acceptBooking>>);

    const error = await executeBookingAction("booking-1", makeAction("accept"), vi.fn());

    expect(error).toBe("Booking was already accepted.");
  });

  it("falls back to a generic message when the error response has no detail", async () => {
    // Deliberately malformed compared to the real API contract (every
    // modeled error status always includes `detail`), to prove the
    // fallback branch in executeBookingAction is reachable.
    mockedAccept.mockResolvedValue({
      status: 409,
      data: {},
      headers: new Headers(),
    } as unknown as Awaited<ReturnType<typeof acceptBooking>>);

    const error = await executeBookingAction("booking-1", makeAction("accept"), vi.fn());

    expect(error).toBe("Something went wrong. Please try again.");
  });

  it("returns an unsupported-action message for an unknown rel", async () => {
    const error = await executeBookingAction("booking-1", makeAction("unknown"), vi.fn());

    expect(error).toBe("This booking action is not supported yet.");
  });
});
