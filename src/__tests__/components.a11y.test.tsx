import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import axe from "axe-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getPublicListings, getServiceTags } from "../api/mira";
import type { PublicListingSummary } from "../api/model";
import { AccessibilityPanel } from "../common/layout/AccessibilityPanel";
import { AvatarIcon } from "../common/ui/AvatarIcon";
import { Badge } from "../common/ui/Badge";
import { Breadcrumb } from "../common/layout/BreadCrumb";
import {
  BookingCard,
  type BookingDetails,
  type BookingSummary,
} from "../features/bookings/BookingCard";
import { BookingPage } from "../features/bookings/BookingPage";
import { Button } from "../common/ui/Button";
import { CalendarGrid } from "../features/bookings/CalendarGrid";
import { CalendarPage } from "../features/bookings/CalendarPage";
import { CategoryCard } from "../features/home/CategoryCard";
import { CreateListing } from "../features/listings/CreateListing";
import { EditListing } from "../features/listings/EditListing";
import type { ListingDetails } from "../api/model";
import { ExceptionModal } from "../features/bookings/ExceptionModal";
import { FilterBar } from "../features/search/FilterBar";
import { Home } from "../features/home/Home";
import { Input } from "../common/ui/Input";
import { Label } from "../common/ui/Label";
import { LoginCallback } from "../features/auth/LoginCallback";
import { Logo } from "../common/ui/Logo";
import { Modal } from "../common/ui/Modal";
import { MultiSelect } from "../common/ui/MultiSelect";
import { MyBookings } from "../features/bookings/MyBookings";
import {
  MyListingCard,
  type MyListingSummary,
} from "../features/listings/MyListingCard";
import { MyListings } from "../features/listings/MyListings";
import { Navbar } from "../common/layout/Navbar";
import { Pagination } from "../common/layout/Pagination";
import * as Popover from "../common/ui/Popover";
import { RegisterAbout } from "../features/register/RegisterAbout";
import { RegisterAddress } from "../features/register/RegisterAddress";
import { RegisterDone } from "../features/register/RegisterDone";
import { RegisterLayout } from "../features/register/RegisterLayout";
import { RegisterName } from "../features/register/RegisterName";
import { RegisterPhoto } from "../features/register/RegisterPhoto";
import { RegisterRole } from "../features/register/RegisterRole";
import { SearchBar } from "../features/search/SearchBar";
import { ServiceCard } from "../features/listings/ServiceCard";
import { ServiceUserToggle } from "../features/search/ServiceUserToggle";
import { UserTypeFilter } from "../features/search/UserTypeFilter";
import { Slider } from "../common/ui/Slider";
import * as Switch from "../common/ui/Switch";
import { Textarea } from "../common/ui/Textarea";
import { UserMenu } from "../common/layout/UserMenu";
import { UserCard } from "../features/search/UserCard";
import { WeeklyScheduleModal } from "../features/bookings/WeeklyScheduleModal";
import { useAuthStore, type User } from "../stores/auth";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    className,
    activeProps,
    ...props
  }: {
    children: ReactNode;
    to: string;
    className?: string;
    activeProps?: { className?: string };
  }) => (
    <a href={to} className={className ?? activeProps?.className} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock("../api/mira", () => ({
  getServiceTags: vi.fn(),
  getPublicListings: vi.fn(),
  logout: vi.fn().mockResolvedValue({ status: 204, data: undefined }),
}));

const mockGetServiceTags = vi.mocked(getServiceTags);
const mockGetPublicListings = vi.mocked(getPublicListings);

function renderHome(listings: PublicListingSummary[] = []) {
  mockGetServiceTags.mockResolvedValue({
    data: [],
    status: 200,
    headers: new Headers(),
  } as never);
  mockGetPublicListings.mockResolvedValue({
    data: { items: listings, cursor: { limit: 8, next: null } },
    status: 200,
    headers: new Headers(),
  } as never);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
  useAuthStore.getState().clear();
});

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
}

const listing: MyListingSummary = {
  listingId: "listing-1",
  title: "Grocery pickup",
  description: "Weekly pickup and drop-off support.",
  price: 24,
  publicationStatus: "ACTIVE",
  moderationStatus: "VISIBLE",
  author: { userId: "user-1", name: "Mira", surname: "Muster" },
  publishedAt: "2026-06-01T12:00:00Z",
  location: { city: "Berlin", postalCode: "10115", serviceRadiusKm: 10 },
  primaryMedia: {
    mediaId: "media-1",
    url: "/listing.jpg",
    altText: "Shopping bags on a kitchen table",
    altTextStatus: "COMPLETED",
  },
  tags: [
    { tagId: "tag-1", name: "Errands", isBarrierefrei: false, isActive: true },
  ],
};

const bookingSummary: BookingSummary = {
  bookingId: "booking-1",
  listingId: "listing-1",
  listing: { title: "Grocery pickup" },
  counterparty: { userId: "user-2", name: "Mira", surname: "Muster" },
  status: "PENDING",
  serviceAddress: {
    street: "Main Street",
    houseNumber: "12",
    city: "Berlin",
    postalCode: "10115",
  },
  totalPrice: 48,
  bookedStart: "2026-07-20T09:00:00.000Z",
  bookedEnd: "2026-07-20T11:00:00.000Z",
  createdAt: "2026-06-15T10:00:00.000Z",
};

const bookingDetails: BookingDetails = {
  ...bookingSummary,
  consumer: { userId: "consumer-1", name: "Clara", surname: "Kunde" },
  provider: { userId: "provider-1", name: "Mira", surname: "Muster" },
  locationType: "AT_CONSUMER",
  description: "Please pick up groceries from the local market.",
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
    { rel: "cancel", href: "/bookings/booking-1/cancel", method: "POST" },
  ],
};

const serviceTags = [
  { tagId: "tag-1", name: "Errands", isBarrierefrei: false, isActive: true },
  { tagId: "tag-2", name: "Accessible", isBarrierefrei: true, isActive: true },
];

const editListing: ListingDetails = {
  listingId: "listing-1",
  title: "Grocery pickup",
  description: "Weekly pickup and drop-off support.",
  price: 24,
  publicationStatus: "ACTIVE",
  moderationStatus: "VISIBLE",
  author: { userId: "user-1", name: "Mira", surname: "Muster" },
  publishedAt: "2026-01-01T00:00:00Z",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  tags: serviceTags,
  location: { city: "Berlin", postalCode: "10115", serviceRadiusKm: 20 },
  media: [
    {
      mediaId: "media-1",
      position: 0,
      url: "/listing.jpg",
      altText: "Shopping bags",
      altTextStatus: "COMPLETED",
      mimeType: "image/jpeg",
      size: 1000,
      width: 800,
      height: 600,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ],
};

const user: User = {
  userId: "user-1",
  username: "mira",
  firstName: "Mira",
  lastName: "Muster",
  userType: "PROVIDER",
  bio: "Friendly local support.",
  simplifiedBio: null,
  selfSummary: "Errands and tech help.",
  accessibilityPreferences: [],
  profileMedia: {
    mediaId: "avatar-1",
    url: "/avatar.jpg",
    altTextStatus: "COMPLETED",
    mimeType: "image/jpeg",
    size: 1024,
    width: 200,
    height: 200,
    createdAt: "2026-06-14T00:00:00.000Z",
  },
  registrationComplete: true,
  isPublic: true,
  privateAddress: {
    street: "Main Street",
    houseNumber: "12",
    postalCode: "10115",
    city: "Berlin",
  },
};

const availability = {
  userId: "provider-1",
  days: [
    {
      date: "2026-07-20",
      workingHours: [
        {
          start: "2026-07-20T09:00:00.000Z",
          end: "2026-07-20T17:00:00.000Z",
        },
      ],
      freeWindows: [
        {
          start: "2026-07-20T09:00:00.000Z",
          end: "2026-07-20T13:00:00.000Z",
        },
      ],
    },
  ],
};

const publicListing = {
  listingId: "listing-1",
  tags: serviceTags,
  title: "Grocery pickup",
  description: "Weekly pickup and drop-off support.",
  easyDescription: null,
  easyDescriptionStatus: "COMPLETED" as const,
  price: 24,
  publicationStatus: "ACTIVE" as const,
  author: { userId: "provider-1", name: "Mira", surname: "Muster" },
  publishedAt: "2026-06-01T12:00:00.000Z",
  location: { city: "Berlin", postalCode: "10115", serviceRadiusKm: 20 },
  createdAt: "2026-06-01T12:00:00.000Z",
  updatedAt: "2026-06-02T12:00:00.000Z",
  media: [],
};

const scheduleEntries = [
  { dayOfWeek: "MON" as const, startTime: "09:00:00", endTime: "17:00:00" },
];

const componentCases: Array<[string, ReactElement]> = [
  ["AccessibilityPanel", <AccessibilityPanel />],
  [
    "AvatarIcon",
    <AvatarIcon firstName="Mira" lastName="Muster" picture="/avatar.jpg" />,
  ],
  ["Badge", <Badge text="Accessible" />],
  [
    "Breadcrumb",
    <Breadcrumb
      links={[
        { name: "Home", href: "/" },
        { name: "Profile", href: "/profile" },
      ]}
    />,
  ],
  ["Button", <Button>Save</Button>],
  ["CategoryCard", <CategoryCard name="Household" imageSrc="/category.jpg" />],
  [
    "FilterBar",
    <FilterBar
      tags={[
        { tagId: "errands", name: "Errands" },
        { tagId: "tutoring", name: "Tutoring" },
      ]}
      selectedTagIds={["errands"]}
      onTagToggle={vi.fn()}
      distanceKm={20}
      onDistanceChange={vi.fn()}
      maxPrice={50}
      onMaxPriceChange={vi.fn()}
      onApply={vi.fn()}
    />,
  ],
  [
    "Input",
    <>
      <Label htmlFor="a11y-input">Name</Label>
      <Input id="a11y-input" />
    </>,
  ],
  [
    "Label",
    <>
      <Label htmlFor="standalone-label">Email</Label>
      <input id="standalone-label" />
    </>,
  ],
  ["Logo", <Logo title="Mira" />],
  [
    "MultiSelect",
    <MultiSelect
      aria-label="Service tags"
      options={[
        { id: "errands", label: "Errands" },
        { id: "support", label: "Support" },
      ]}
      value={["errands"]}
      onChange={vi.fn()}
    />,
  ],
  ["MyListingCard", <MyListingCard listing={listing} onEdit={vi.fn()} />],
  ["Navbar", <Navbar />],
  ["Pagination", <Pagination onPrevious={vi.fn()} onNext={vi.fn()} />],
  [
    "Popover",
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button>Menu</Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <Button>Action</Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>,
  ],
  ["SearchBar", <SearchBar aria-label="Search services" city="Berlin" />],
  [
    "ServiceCard",
    <ServiceCard
      link="/services/1"
      pictureLink="/service.jpg"
      location="Berlin"
      providerFirstName="Mira"
      providerLastName="Muster"
      varified
      label="Shopping help"
      description="Help with weekly shopping."
      tags={[
        { tagId: "errands", name: "Errands", isBarrierefrei: false, isActive: true },
      ]}
      hourRate={20}
    />,
  ],
  [
    "ServiceUserToggle",
    <ServiceUserToggle
      id="provider-toggle"
      labelLeft="Customer"
      labelRight="Provider"
      checked={false}
      onCheckedChange={vi.fn()}
    />,
  ],
  ["Slider", <Slider label="Distance" min={1} max={50} unit="km" />],
  [
    "Switch",
    <Switch.Root
      aria-label="Reduce motion"
      checked={false}
      onCheckedChange={vi.fn()}
    >
      <Switch.Thumb />
    </Switch.Root>,
  ],
  [
    "Textarea",
    <>
      <Label htmlFor="a11y-textarea">Description</Label>
      <Textarea id="a11y-textarea" />
    </>,
  ],
  ["UserMenu", <UserMenu firstName="Mira" lastName="Muster" isProvider />],
  [
    "UserTypeFilter",
    <UserTypeFilter
      selected="everyone"
      providerCount={4}
      consumerCount={4}
      onChange={vi.fn()}
    />,
  ],
  [
    "UserCard (consumer)",
    <UserCard
      profile={{
        userId: "user-1",
        username: "anna.w",
        firstName: "Anna",
        lastName: "Weber",
        userType: "CUSTOMER",
        city: "Berlin",
        bio: "I use Mira to find friendly help with my laptop and phone.",
        simplifiedBio: null,
        selfSummary: null,
        accessibilityPreferences: [],
        profileMedia: null,
        verified: true,
      }}
      easyRead={false}
    />,
  ],
  [
    "UserCard (provider, base)",
    <UserCard
      profile={{
        userId: "user-2",
        username: "patrick.s",
        firstName: "Patrick",
        lastName: "Smith",
        userType: "PROVIDER",
        city: "Berlin",
        bio: "Five years helping friends and neighbours with everyday tech.",
        simplifiedBio: null,
        selfSummary: null,
        accessibilityPreferences: [],
        profileMedia: null,
        verified: true,
      }}
      easyRead={false}
    />,
  ],
  [
    "UserCard (provider, enriched)",
    <UserCard
      profile={{
        userId: "user-2",
        username: "patrick.s",
        firstName: "Patrick",
        lastName: "Smith",
        userType: "PROVIDER",
        city: "Berlin",
        bio: "Five years helping friends and neighbours with everyday tech.",
        simplifiedBio: null,
        selfSummary: null,
        accessibilityPreferences: [],
        profileMedia: null,
        verified: true,
      }}
      easyRead={false}
      providerSummary={{
        serviceCount: 4,
        startingPrice: 20,
        topTags: [
          { tagId: "wifi", name: "Laptop & Wi-Fi Setup", usageCount: 2, isBarrierefrei: false, minPrice: 22 },
          { tagId: "a11y", name: "Accessible tech help", usageCount: 1, isBarrierefrei: true, minPrice: 28 },
        ],
      }}
    />,
  ],
];

describe("component accessibility", () => {
  it.each(componentCases)(
    "%s has no automated accessibility violations",
    async (_name, ui) => {
      const { container } = render(ui);
      await expectNoAxeViolations(container);
    },
  );

  it("CalendarGrid has no automated accessibility violations", async () => {
    const { container } = render(
      <CalendarGrid
        year={2026}
        month={7}
        onMonthChange={vi.fn()}
        renderDay={(date) => (
          <button type="button" aria-label={date.toDateString()}>
            {date.getDate()}
          </button>
        )}
      />,
    );

    await expectNoAxeViolations(container);
  });

  it("CalendarGrid navigation states have no automated accessibility violations", async () => {
    const onMonthChange = vi.fn();
    const { container, rerender } = render(
      <CalendarGrid
        year={2026}
        month={1}
        onMonthChange={onMonthChange}
        renderDay={(date) => (
          <button type="button" aria-label={date.toDateString()}>
            {date.getDate()}
          </button>
        )}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
    });
    expect(onMonthChange).toHaveBeenCalledWith(2025, 12);
    expect(onMonthChange).toHaveBeenCalledWith(2026, 2);

    rerender(
      <CalendarGrid
        year={2026}
        month={12}
        onMonthChange={onMonthChange}
        minDate={new Date("2026-12-01T00:00:00.000Z")}
        maxDate={new Date("2026-12-31T00:00:00.000Z")}
        renderDay={(date) => (
          <button type="button" aria-label={date.toDateString()}>
            {date.getDate()}
          </button>
        )}
      />,
    );

    expect(screen.getByRole("button", { name: /previous month/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next month/i })).toBeDisabled();

    rerender(
      <CalendarGrid
        year={2026}
        month={7}
        onMonthChange={onMonthChange}
        renderDay={(date) => (
          <button type="button" aria-label={date.toDateString()}>
            {date.getDate()}
          </button>
        )}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /previous month/i }));
    });
    rerender(
      <CalendarGrid
        year={2026}
        month={12}
        onMonthChange={onMonthChange}
        renderDay={(date) => (
          <button type="button" aria-label={date.toDateString()}>
            {date.getDate()}
          </button>
        )}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
    });
    expect(onMonthChange).toHaveBeenCalledWith(2026, 6);
    expect(onMonthChange).toHaveBeenCalledWith(2027, 1);
    await expectNoAxeViolations(container);
  });

  it("BookingCard expanded state has no automated accessibility violations", async () => {
    const { container } = render(
      <BookingCard
        booking={bookingSummary}
        mockDetail={bookingDetails}
        onActionComplete={vi.fn()}
        loadBookingDetails={vi.fn()}
        performBookingAction={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /expand booking details/i }),
      );
    });

    await expectNoAxeViolations(container);
  });

  it("MyBookings populated state has no automated accessibility violations", async () => {
    const { container } = render(
      <MyBookings
        bookings={[bookingSummary]}
        isProvider
        loading={false}
        error={null}
        onActionComplete={vi.fn()}
        loadBookingDetails={vi.fn().mockResolvedValue(bookingDetails)}
        performBookingAction={vi.fn().mockResolvedValue(null)}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /requests/i }));
    });

    await expectNoAxeViolations(container);
  });

  it.each([
    ["loading", { listings: [], loading: true, error: null }],
    ["error", { listings: [], loading: false, error: "Could not load." }],
    ["populated", { listings: [listing], loading: false, error: null }],
  ])(
    "MyListings %s state has no automated accessibility violations",
    async (_name, state) => {
      const { container } = render(
        <MyListings
          listings={state.listings}
          statusFilter="ALL"
          statusCounts={{ ALL: state.listings.length, ACTIVE: 1 }}
          loading={state.loading}
          error={state.error}
          hasPreviousPage={false}
          hasNextPage={state.listings.length > 0}
          onStatusFilterChange={vi.fn()}
          onCreate={vi.fn()}
          onEdit={vi.fn()}
          onNextPage={vi.fn()}
          onPreviousPage={vi.fn()}
        />,
      );

      await expectNoAxeViolations(container);
    },
  );

  it("CreateListing validation state has no automated accessibility violations", async () => {
    const { container } = render(
      <CreateListing
        availableTags={serviceTags}
        tagsLoading={false}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save/i }));
    });

    await expectNoAxeViolations(container);
  });

  it.each([
    ["loading", { listing: null, loadError: null }],
    ["error", { listing: null, loadError: "Could not load service." }],
    ["loaded", { listing: editListing, loadError: null }],
  ])(
    "EditListing %s state has no automated accessibility violations",
    async (_name, state) => {
      const { container } = render(
        <EditListing
          listing={state.listing}
          loadError={state.loadError}
          availableTags={serviceTags}
          tagsLoading={false}
          onBack={vi.fn()}
          onSubmit={vi.fn()}
          onDelete={vi.fn()}
          onRemoveImage={vi.fn()}
          onStatusAction={vi.fn()}
          onRefreshMedia={vi.fn().mockResolvedValue(editListing.media)}
        />,
      );

      if (state.listing) {
        await waitFor(() => {
          expect(screen.getByDisplayValue(/grocery pickup/i)).toBeInTheDocument();
        });
      }

      await expectNoAxeViolations(container);
    },
  );

  it("Home has no automated accessibility violations", async () => {
    const { container } = renderHome([
      {
        listingId: "listing-1",
        tags: serviceTags,
        title: "Grocery pickup",
        description: "Weekly pickup and drop-off support.",
        easyDescriptionStatus: "COMPLETED",
        price: 24,
        author: { userId: "user-1", name: "Mira", surname: "Muster" },
        publishedAt: "2026-06-01T12:00:00.000Z",
        location: { city: "Berlin", postalCode: "10115", serviceRadiusKm: 5 },
      } as PublicListingSummary,
    ]);

    await waitFor(() => {
      expect(screen.getByText(/mira m\./i)).toBeInTheDocument();
    });
    await expectNoAxeViolations(container);
  });

  it("BookingPage booking flow has no automated accessibility violations", async () => {
    const { container } = render(
      <BookingPage
        listingId="listing-1"
        year={2026}
        month={7}
        availability={availability}
        listing={publicListing}
        bookingPending={false}
        bookingError={null}
        onMonthChange={vi.fn()}
        onBack={vi.fn()}
        onCreateBooking={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /monday, july 20/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /11:00/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("option", { name: /11:00/i }));
      fireEvent.click(screen.getByRole("radio", { name: /at my place/i }));
      fireEvent.change(
        screen.getByRole("textbox", {
          name: /tell the provider what you need/i,
        }),
        {
        target: { value: "Please pick up groceries from the market." },
        },
      );
    });

    await expectNoAxeViolations(container);
  });

  it("BookingPage duration, navigation, and submit states have no automated accessibility violations", async () => {
    const onMonthChange = vi.fn();
    const onCreateBooking = vi.fn();
    const onBack = vi.fn();
    const { container } = render(
      <BookingPage
        listingId="listing-1"
        year={2026}
        month={7}
        availability={{
          userId: "provider-1",
          days: [
            {
              date: "2026-07-20",
              workingHours: [
                {
                  start: "2026-07-20T06:00:00.000Z",
                  end: "2026-07-20T14:00:00.000Z",
                },
              ],
              freeWindows: [
                {
                  start: "2026-07-20T06:00:00.000Z",
                  end: "2026-07-20T14:00:00.000Z",
                },
              ],
            },
            {
              date: "2026-07-21",
              workingHours: [],
              freeWindows: [],
            },
          ],
        }}
        listing={publicListing}
        bookingPending={false}
        bookingError="Booking failed."
        onMonthChange={onMonthChange}
        onBack={onBack}
        onCreateBooking={onCreateBooking}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /go back/i }));
      fireEvent.click(screen.getByRole("button", { name: /next month/i }));
    });
    expect(onBack).toHaveBeenCalled();
    expect(onMonthChange).toHaveBeenCalledWith(2026, 8);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /monday, july 20/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /08:00/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("option", { name: /08:00/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /increase duration/i }),
      ).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /increase duration/i }));
    });
    await waitFor(() => {
      expect(screen.getAllByText("2h").length).toBeGreaterThan(0);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /decrease duration/i }));
    });
    await waitFor(() => {
      expect(screen.getAllByText("1h").length).toBeGreaterThan(0);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: /provider's place/i }));
      fireEvent.change(
        screen.getByRole("textbox", {
          name: /tell the provider what you need/i,
        }),
        { target: { value: "Set up the printer and home Wi-Fi." } },
      );
      fireEvent.click(screen.getByRole("button", { name: /send booking request/i }));
    });

    expect(onCreateBooking).toHaveBeenCalledWith({
      listingId: "listing-1",
      bookedStart: "2026-07-20T08:00:00",
      durationHours: 1,
      locationType: "AT_PROVIDER",
      description: "Set up the printer and home Wi-Fi.",
    });
    await expectNoAxeViolations(container);
  });

  it("BookingPage unavailable month and pending states have no automated accessibility violations", async () => {
    const { container } = render(
      <BookingPage
        listingId="listing-1"
        year={2026}
        month={7}
        availability={{
          userId: "provider-1",
          days: [
            {
              date: "2026-07-20",
              workingHours: [],
              freeWindows: [],
            },
          ],
        }}
        listing={undefined}
        bookingPending
        bookingError={null}
        onMonthChange={vi.fn()}
        onBack={vi.fn()}
        onCreateBooking={vi.fn()}
      />,
    );

    expect(screen.getByText(/no availability this month/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sending/i }),
    ).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it("CalendarPage provider state has no automated accessibility violations", async () => {
    const selectedDate = new Date("2026-07-20T12:00:00.000Z");
    const { container } = render(
      <CalendarPage
        userId="provider-1"
        isProvider
        today={new Date("2026-07-15T12:00:00.000Z")}
        year={2026}
        month={7}
        selectedDate={selectedDate}
        monthBookings={[bookingSummary]}
        upcomingBookings={[bookingSummary]}
        scheduleEntries={scheduleEntries}
        scheduleLoaded
        scheduleLoading={false}
        exceptions={[
          {
            exceptionId: "exception-1",
            userId: "provider-1",
            date: "2026-07-21",
            exceptionType: "BLOCKED",
            startTime: null,
            endTime: null,
            createdAt: "2026-06-15T10:00:00.000Z",
            updatedAt: "2026-06-15T10:00:00.000Z",
          },
        ]}
        scheduleSaving={false}
        scheduleError={null}
        exceptionCreating={false}
        exceptionError={null}
        onMonthChange={vi.fn()}
        onSelectedDateChange={vi.fn()}
        onToday={vi.fn()}
        onSaveSchedule={vi.fn()}
        onCreateException={vi.fn()}
        onUpdateException={vi.fn()}
        onDeleteException={vi.fn()}
      />,
    );

    await expectNoAxeViolations(container);
  });

  it("CalendarPage provider modals and calendar actions have no automated accessibility violations", async () => {
    const onToday = vi.fn();
    const onSelectedDateChange = vi.fn();
    const onSaveSchedule = vi.fn();
    const onCreateException = vi.fn();
    const { container } = render(
      <CalendarPage
        userId="provider-1"
        isProvider
        today={new Date("2026-07-15T12:00:00.000Z")}
        year={2026}
        month={7}
        selectedDate={new Date("2026-07-20T12:00:00.000Z")}
        monthBookings={[
          bookingSummary,
          { ...bookingSummary, bookingId: "booking-2", status: "PAID" },
        ]}
        upcomingBookings={[]}
        scheduleEntries={[]}
        scheduleLoaded
        scheduleLoading={false}
        exceptions={[
          {
            exceptionId: "exception-1",
            userId: "provider-1",
            date: "2026-07-20",
            exceptionType: "BLOCKED",
            startTime: "10:00:00",
            endTime: "12:00:00",
            createdAt: "2026-06-15T10:00:00.000Z",
            updatedAt: "2026-06-15T10:00:00.000Z",
          },
          {
            exceptionId: "exception-2",
            userId: "provider-1",
            date: "2026-07-22",
            exceptionType: "AVAILABLE",
            startTime: "18:00:00",
            endTime: "20:00:00",
            createdAt: "2026-06-15T10:00:00.000Z",
            updatedAt: "2026-06-15T10:00:00.000Z",
          },
        ]}
        scheduleSaving={false}
        scheduleError={{ detail: "Schedule failed." }}
        exceptionCreating={false}
        exceptionError={{ detail: "Exception failed." }}
        onMonthChange={vi.fn()}
        onSelectedDateChange={onSelectedDateChange}
        onToday={onToday}
        onSaveSchedule={onSaveSchedule}
        onCreateException={onCreateException}
        onUpdateException={vi.fn()}
        onDeleteException={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /today/i }));
      fireEvent.click(screen.getByRole("button", { name: /tuesday, july 21/i }));
    });
    expect(onToday).toHaveBeenCalled();
    expect(onSelectedDateChange).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /weekly schedule/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /weekly schedule/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/schedule failed/i)).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /save schedule/i }));
    });
    expect(onSaveSchedule).toHaveBeenCalled();

    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /add exception/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /schedule exceptions/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/exception failed/i)).toBeInTheDocument();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: "2026-08-01" },
      });
      fireEvent.click(screen.getByRole("button", { name: /block this time/i }));
    });
    expect(onCreateException).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("Modal open state has no automated accessibility violations", async () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        title="Confirm action"
        description="Review before continuing."
      >
        <Button>Continue</Button>
      </Modal>,
    );

    await expectNoAxeViolations(document.body);
  });

  it("WeeklyScheduleModal has no automated accessibility violations", async () => {
    render(
      <WeeklyScheduleModal
        open
        onClose={vi.fn()}
        entries={scheduleEntries}
        isLoading={false}
        isSaving={false}
        errorMessage={null}
        onSave={vi.fn()}
      />,
    );

    await expectNoAxeViolations(document.body);
  });

  it("ExceptionModal manage tab has no automated accessibility violations", async () => {
    render(
      <ExceptionModal
        open
        onClose={vi.fn()}
        exceptions={[
          {
            exceptionId: "exception-1",
            date: "2026-07-21",
            exceptionType: "AVAILABLE",
            startTime: "09:00:00",
            endTime: "12:00:00",
          },
        ]}
        isCreating={false}
        errorMessage={null}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /manage exceptions/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /edit times/i }),
      ).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /edit times/i }));
    });

    await expectNoAxeViolations(document.body);
  });

  it("ExceptionModal manage actions have no automated accessibility violations", async () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    render(
      <ExceptionModal
        open
        onClose={vi.fn()}
        exceptions={[
          {
            exceptionId: "exception-1",
            date: "2026-07-21",
            exceptionType: "AVAILABLE",
            startTime: "09:00:00",
            endTime: "12:00:00",
          },
          {
            exceptionId: "exception-2",
            date: "2026-07-22",
            exceptionType: "BLOCKED",
            startTime: null,
            endTime: null,
          },
        ]}
        isCreating={false}
        errorMessage={null}
        onCreate={vi.fn()}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /manage exceptions/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /edit times/i }));
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: "13:00" },
      });
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: "14:00" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });
    expect(onUpdate).toHaveBeenCalledWith("exception-1", {
      startTime: "13:00",
      endTime: "14:00",
    });

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /delete exception/i }),
      ).toHaveLength(2);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete exception/i })[0]);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    });
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /delete exception/i }),
      ).toHaveLength(2);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /delete exception/i })[1]);
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));
    });
    expect(onDelete).toHaveBeenCalledWith("exception-2");

    await expectNoAxeViolations(document.body);
  });

  it("ExceptionModal add submit and close states have no automated accessibility violations", async () => {
    const onCreate = vi.fn();
    const onClose = vi.fn();
    render(
      <ExceptionModal
        open
        onClose={onClose}
        exceptions={[]}
        isCreating={false}
        errorMessage={null}
        onCreate={onCreate}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: "2026-07-30" },
      });
      fireEvent.click(screen.getByRole("button", { name: /block this time/i }));
    });
    expect(onCreate).toHaveBeenCalledWith({
      date: "2026-07-30",
      exceptionType: "BLOCKED",
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /add extra availability/i }));
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: "2026-08-01" },
      });
      fireEvent.click(screen.getByRole("button", { name: /add availability/i }));
    });
    expect(onCreate).toHaveBeenLastCalledWith({
      date: "2026-08-01",
      exceptionType: "AVAILABLE",
      startTime: "09:00",
      endTime: "17:00",
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    });
    expect(onClose).toHaveBeenCalled();
    await expectNoAxeViolations(document.body);
  });

  it("ExceptionModal add form validation states have no automated accessibility violations", async () => {
    render(
      <ExceptionModal
        open
        onClose={vi.fn()}
        exceptions={[]}
        isCreating={false}
        errorMessage="Could not save exception."
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /add extra availability/i }),
      );
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: "17:00" },
      });
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: "09:00" },
      });
    });

    await expectNoAxeViolations(document.body);
  });

  it("WeeklyScheduleModal edited state has no automated accessibility violations", async () => {
    const onSave = vi.fn();
    render(
      <WeeklyScheduleModal
        open
        onClose={vi.fn()}
        entries={scheduleEntries}
        isLoading={false}
        isSaving={false}
        errorMessage="Could not save schedule."
        onSave={onSave}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByLabelText(/tuesday/i));
      fireEvent.change(screen.getByLabelText(/tuesday start time/i), {
        target: { value: "10:00" },
      });
      fireEvent.click(screen.getByRole("button", { name: /save schedule/i }));
    });

    expect(onSave).toHaveBeenCalled();
    await expectNoAxeViolations(document.body);
  });

  it("LoginCallback error state has no automated accessibility violations", async () => {
    const { container } = render(
      <LoginCallback error="oauth2_failed" retryHref="/auth/login/google" />,
    );

    await expectNoAxeViolations(container);
  });

  it.each([
    [
      "RegisterLayout",
      <RegisterLayout user={user} pathname="/register/about">
        <h2 id="register-step-heading">About you</h2>
      </RegisterLayout>,
    ],
    [
      "RegisterName",
      <RegisterName
        initialValues={{ firstName: "Mira", lastName: "Muster", username: "mira" }}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    ],
    [
      "RegisterAddress",
      <RegisterAddress
        initialValues={{ privateAddress: user.privateAddress }}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    ],
    [
      "RegisterAbout",
      <RegisterAbout
        initialValues={{
          userType: "PROVIDER",
          selfSummary: "Errands and tech help.",
          bio: "Friendly local support.",
        }}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    ],
    [
      "RegisterPhoto",
      <RegisterPhoto initialValues={user} onBack={vi.fn()} onContinue={vi.fn()} />,
    ],
    [
      "RegisterRole",
      <RegisterRole currentUserType="PROVIDER" onContinue={vi.fn()} />,
    ],
    [
      "RegisterDone",
      <RegisterDone user={user} onFindServices={vi.fn()} />,
    ],
  ] satisfies Array<[string, ReactElement]>)(
    "%s has no automated accessibility violations",
    async (_name, ui) => {
      const { container } = render(ui);
      await expectNoAxeViolations(container);
    },
  );

  it("RegisterName validation and server error states have no automated accessibility violations", async () => {
    const onContinue = vi
      .fn()
      .mockRejectedValueOnce({ field: "username", message: "Taken." })
      .mockRejectedValueOnce(new Error("Could not save profile."));
    const { container } = render(
      <RegisterName initialValues={null} onBack={vi.fn()} onContinue={onContinue} />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: "Mira" },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: "Muster" },
      });
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "mira" },
      });
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await waitFor(() => expect(screen.getByText("Taken.")).toBeInTheDocument());
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "mira_2" },
      });
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/could not save profile/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);
  });

  it("RegisterAddress validation and server error states have no automated accessibility violations", async () => {
    const onContinue = vi.fn().mockRejectedValue(new Error("Address failed."));
    const { container } = render(
      <RegisterAddress
        initialValues={null}
        onBack={vi.fn()}
        onContinue={onContinue}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "Main Street" },
      });
      fireEvent.change(screen.getByLabelText(/house number/i), {
        target: { value: "12a" },
      });
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "10115" },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: "Berlin" },
      });
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/address failed/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);
  });

  it("RegisterAbout validation and server error states have no automated accessibility violations", async () => {
    const onContinue = vi.fn().mockRejectedValue(new Error("About failed."));
    const { container } = render(
      <RegisterAbout
        initialValues={{ userType: "PROVIDER", selfSummary: null, bio: null }}
        onBack={vi.fn()}
        onContinue={onContinue}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/short tagline/i), {
        target: { value: "Local errands" },
      });
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/about failed/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);
  });

  it("RegisterPhoto file and submit error states have no automated accessibility violations", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:preview");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const onContinue = vi.fn().mockRejectedValue(new Error("Upload failed."));
    const { container, unmount } = render(
      <RegisterPhoto initialValues={null} onBack={vi.fn()} onContinue={onContinue} />,
    );
    const input = screen.getByLabelText(/choose photo/i);

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [new File(["bad"], "profile.gif", { type: "image/gif" })],
        },
      });
    });
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.change(input, {
        target: {
          files: [new File(["ok"], "profile.png", { type: "image/png" })],
        },
      });
      fireEvent.click(screen.getByRole("button", { name: /finish/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument(),
    );

    expect(createObjectURL).toHaveBeenCalled();
    await expectNoAxeViolations(container);

    unmount();
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it("RegisterRole submit failure state has no automated accessibility violations", async () => {
    const { container } = render(
      <RegisterRole
        currentUserType={null}
        onContinue={vi.fn().mockRejectedValue(new Error("Role failed."))}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: /i need help/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/role failed/i)).toBeInTheDocument(),
    );

    await expectNoAxeViolations(container);
  });

  it("CreateListing valid submit and image preview states have no automated accessibility violations", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:listing-preview");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const onSubmit = vi.fn().mockRejectedValue(new Error("Create failed."));
    const { container } = render(
      <CreateListing
        availableTags={serviceTags}
        tagsLoading={false}
        onBack={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "Computer setup" },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "I help set up computers, printers, and Wi-Fi." },
      });
      fireEvent.change(screen.getByLabelText(/hourly rate/i), {
        target: { value: "25" },
      });
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "Main Street" },
      });
      fireEvent.change(screen.getByPlaceholderText("12a"), {
        target: { value: "12" },
      });
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "10115" },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: "Berlin" },
      });
      fireEvent.change(screen.getByLabelText(/service radius/i), {
        target: { value: "40" },
      });
      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: {
          files: [new File(["image"], "listing.png", { type: "image/png" })],
        },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /service tags/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("option", { name: /errands/i }));
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /service tags, 1 selected/i }),
      );
    });
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });

    await waitFor(() =>
      expect(screen.getByText(/create failed/i)).toBeInTheDocument(),
    );
    expect(createObjectURL).toHaveBeenCalled();
    await expectNoAxeViolations(container);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it("CreateListing field blur and image removal states have no automated accessibility violations", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:create-remove-preview");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const onBack = vi.fn();
    const { container } = render(
      <CreateListing
        availableTags={serviceTags}
        tagsLoading
        onBack={onBack}
        onSubmit={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /back to my services/i }),
      );
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "No" },
      });
      fireEvent.blur(screen.getByLabelText(/title/i));
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "Too short" },
      });
      fireEvent.blur(screen.getByLabelText(/description/i));
      fireEvent.change(screen.getByLabelText(/hourly rate/i), {
        target: { value: "-1" },
      });
      fireEvent.blur(screen.getByLabelText(/hourly rate/i));
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "x".repeat(121) },
      });
      fireEvent.blur(screen.getByLabelText(/street/i));
      fireEvent.change(screen.getByPlaceholderText("12a"), {
        target: { value: "x".repeat(21) },
      });
      fireEvent.blur(screen.getByPlaceholderText("12a"));
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "1234" },
      });
      fireEvent.blur(screen.getByLabelText(/postal code/i));
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: "x".repeat(121) },
      });
      fireEvent.blur(screen.getByLabelText(/city/i));
      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: {
          files: [new File(["image"], "listing.png", { type: "image/png" })],
        },
      });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /remove image 1/i }));
    });

    expect(onBack).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:create-remove-preview");
    await expectNoAxeViolations(container);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it("EditListing destructive and media states have no automated accessibility violations", async () => {
    const onRemoveImage = vi.fn().mockRejectedValue(new Error("Remove failed."));
    const { container } = render(
      <EditListing
        listing={editListing}
        loadError={null}
        availableTags={serviceTags}
        tagsLoading={false}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
        onDelete={vi.fn().mockRejectedValue(new Error("Delete failed."))}
        onRemoveImage={onRemoveImage}
        onStatusAction={vi.fn().mockRejectedValue(new Error("Pause failed."))}
        onRefreshMedia={vi.fn().mockResolvedValue(editListing.media)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(/grocery pickup/i)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /remove image: shopping bags/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/remove failed/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/pause failed/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /delete service/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /yes, delete/i }),
      ).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/delete failed/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);
  });

  it("EditListing validation, cancel delete, and new image removal states have no automated accessibility violations", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:edit-remove-preview");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const onBack = vi.fn();
    const { container } = render(
      <EditListing
        listing={editListing}
        loadError={null}
        availableTags={serviceTags}
        tagsLoading
        onBack={onBack}
        onSubmit={vi.fn()}
        onDelete={vi.fn()}
        onRemoveImage={vi.fn()}
        onStatusAction={vi.fn()}
        onRefreshMedia={vi.fn().mockResolvedValue(editListing.media)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(/grocery pickup/i)).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /back to my services/i }),
      );
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "No" },
      });
      fireEvent.blur(screen.getByLabelText(/title/i));
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "Too short" },
      });
      fireEvent.blur(screen.getByLabelText(/description/i));
      fireEvent.change(screen.getByLabelText(/hourly rate/i), {
        target: { value: "-1" },
      });
      fireEvent.blur(screen.getByLabelText(/hourly rate/i));
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "Main Street" },
      });
      fireEvent.change(screen.getByLabelText(/^no\.$/i), {
        target: { value: "12" },
      });
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "1234" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/must be exactly 5 digits/i)).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "" },
      });
      fireEvent.blur(screen.getByLabelText(/street/i));
      fireEvent.change(screen.getByLabelText(/^no\.$/i), {
        target: { value: "" },
      });
      fireEvent.blur(screen.getByLabelText(/^no\.$/i));
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: "" },
      });
      fireEvent.blur(screen.getByLabelText(/city/i));
      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: {
          files: [new File(["image"], "new-listing.png", { type: "image/png" })],
        },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /remove image 1/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /delete service/i }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    });

    expect(onBack).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:edit-remove-preview");
    await expectNoAxeViolations(container);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it.each([
    [
      "draft",
      {
        listing: { ...editListing, publicationStatus: "DRAFT" as const },
        action: /publish/i,
        error: "Publish failed.",
      },
    ],
    [
      "paused",
      {
        listing: { ...editListing, publicationStatus: "PAUSED" as const },
        action: /resume/i,
        error: "Resume failed.",
      },
    ],
    [
      "deleted",
      {
        listing: { ...editListing, publicationStatus: "DELETED" as const },
        action: null,
        error: null,
      },
    ],
  ])(
    "EditListing %s status state has no automated accessibility violations",
    async (_name, state) => {
      const onStatusAction = vi.fn().mockRejectedValue(new Error(state.error ?? ""));
      const { container } = render(
        <EditListing
          listing={state.listing}
          loadError={null}
          availableTags={serviceTags}
          tagsLoading={false}
          onBack={vi.fn()}
          onSubmit={vi.fn()}
          onDelete={vi.fn()}
          onRemoveImage={vi.fn()}
          onStatusAction={onStatusAction}
          onRefreshMedia={vi.fn().mockResolvedValue(state.listing.media)}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue(/grocery pickup/i)).toBeInTheDocument();
      });

      if (state.action && state.error) {
        await act(async () => {
          fireEvent.click(screen.getByRole("button", { name: state.action }));
        });
        await waitFor(() =>
          expect(screen.getByText(state.error!)).toBeInTheDocument(),
        );
      }

      await expectNoAxeViolations(container);
    },
  );

  it("EditListing valid save and new image states have no automated accessibility violations", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:new-listing-preview");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <EditListing
        listing={editListing}
        loadError={null}
        availableTags={serviceTags}
        tagsLoading={false}
        onBack={vi.fn()}
        onSubmit={onSubmit}
        onDelete={vi.fn()}
        onRemoveImage={vi.fn()}
        onStatusAction={vi.fn()}
        onRefreshMedia={vi.fn().mockResolvedValue(editListing.media)}
      />,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(/grocery pickup/i)).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: {
          files: [new File(["image"], "new-listing.png", { type: "image/png" })],
        },
      });
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "Main Street" },
      });
      fireEvent.change(screen.getByLabelText(/^no\.$/i), {
        target: { value: "12" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(createObjectURL).toHaveBeenCalled();
    await expectNoAxeViolations(container);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it("BookingCard async detail and action error states have no automated accessibility violations", async () => {
    const loadBookingDetails = vi.fn().mockResolvedValue(bookingDetails);
    const performBookingAction = vi.fn().mockResolvedValue("Action failed.");
    const { container } = render(
      <BookingCard
        booking={{ ...bookingSummary, status: "CONFIRMED" }}
        onActionComplete={vi.fn()}
        loadBookingDetails={loadBookingDetails}
        performBookingAction={performBookingAction}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /expand booking details/i }),
      );
    });
    await waitFor(() => expect(loadBookingDetails).toHaveBeenCalled());
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /accept booking/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/action failed/i)).toBeInTheDocument(),
    );

    await expectNoAxeViolations(container);
  });

  it("BookingCard awaiting confirmation status text has no automated accessibility violations", async () => {
    const { container } = render(
      <BookingCard
        booking={{ ...bookingSummary, status: "AWAITING_CONFIRMATION" }}
        mockDetail={{
          ...bookingDetails,
          autoConfirmAt: "2026-07-21T12:00:00.000Z",
          allowedActions: [],
        }}
        onActionComplete={vi.fn()}
        loadBookingDetails={vi.fn()}
        performBookingAction={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /expand booking details/i }),
      );
    });

    await expectNoAxeViolations(container);
  });

  it("Modal keyboard close and focus trap have no automated accessibility violations", async () => {
    const onClose = vi.fn();
    render(
      <div>
        <Button>Before</Button>
        <Modal open onClose={onClose} title="Keyboard modal">
          <Button>First action</Button>
          <Button>Last action</Button>
        </Modal>
      </div>,
    );

    await act(async () => {
      fireEvent.keyDown(document, { key: "Tab" });
      screen.getByRole("button", { name: /last action/i }).focus();
      fireEvent.keyDown(document, { key: "Tab" });
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(onClose).toHaveBeenCalled();
    await expectNoAxeViolations(document.body);
  });

  it("RegisterLayout done and unauthenticated states have no automated accessibility violations", async () => {
    const done = render(
      <RegisterLayout user={user} pathname="/register/done">
        <h2 id="register-step-heading">Done</h2>
      </RegisterLayout>,
    );
    await expectNoAxeViolations(done.container);
    done.unmount();

    const upcoming = render(
      <RegisterLayout user={null} pathname="/register/name">
        <h2 id="register-step-heading">Your name</h2>
      </RegisterLayout>,
    );
    await expectNoAxeViolations(upcoming.container);
  });

  it("Home fallback data and carousel controls have no automated accessibility violations", async () => {
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    const { container } = renderHome();

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/search for a service/i), {
        target: { value: "cleaning" },
      });
      fireEvent.click(screen.getByRole("button", { name: /scroll categories right/i }));
      fireEvent.click(screen.getByRole("button", { name: /scroll listings left/i }));
    });

    expect(scrollBy).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("AccessibilityPanel has no automated accessibility violations when opened", async () => {
    render(<AccessibilityPanel />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /accessibility/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /accessibility settings/i }),
      ).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/easy language/i)).toBeInTheDocument();
    expect(screen.queryByText(/german/i)).not.toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });

  it("UserMenu has no automated accessibility violations when opened", async () => {
    render(<UserMenu firstName="Mira" lastName="Muster" isProvider />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /mira m\./i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /user menu/i }),
      ).toBeInTheDocument();
    });
    await expectNoAxeViolations(document.body);
  });

  it("SearchBar has no automated accessibility violations when location filters are opened", async () => {
    render(<SearchBar aria-label="Search services" city="Berlin" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /berlin · 20km/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /search location filters/i }),
      ).toBeInTheDocument();
    });
    await expectNoAxeViolations(document.body);
  });

  it("AvatarIcon fallback states have no automated accessibility violations", async () => {
    const { container, rerender } = render(
      <AvatarIcon firstName="Mira" lastName="Muster" />,
    );
    await expectNoAxeViolations(container);

    rerender(<AvatarIcon picture="/broken-avatar.jpg" />);
    await act(async () => {
      fireEvent.error(screen.getByRole("img", { name: /user avatar/i }));
    });

    expect(screen.getByText("?")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("Button icon and loading states have no automated accessibility violations", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const warningRender = render(<Button variant="icon">Missing label</Button>);
    expect(warn).toHaveBeenCalledWith(
      "[Button] icon variant is missing `aria-label`.",
    );
    warningRender.unmount();
    warn.mockRestore();

    const { container } = render(
      <div>
        <Button variant="icon" size="lg" aria-label="Open filters">
          F
        </Button>
        <Button variant="accent" size="sm" loading fullWidth>
          Save
        </Button>
      </div>,
    );

    await expectNoAxeViolations(container);
  });

  it("FilterBar search and collapsed sections have no automated accessibility violations", async () => {
    const { container } = render(
      <FilterBar
        tags={[
          { tagId: "errands", name: "Errands" },
          { tagId: "tutoring", name: "Tutoring" },
        ]}
        selectedTagIds={["errands"]}
        onTagToggle={vi.fn()}
        distanceKm={20}
        onDistanceChange={vi.fn()}
        maxPrice={50}
        onMaxPriceChange={vi.fn()}
        onApply={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/search tags/i), {
        target: { value: "tut" },
      });
      fireEvent.click(screen.getByRole("button", { name: /tags/i }));
    });

    expect(screen.getByRole("button", { name: /tags/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expectNoAxeViolations(container);
  });

  it("MultiSelect option list states have no automated accessibility violations", async () => {
    const { container } = render(
      <MultiSelect
        id="tag-select"
        aria-label="Service tags"
        aria-describedby="tag-help"
        options={[
          { id: "errands", label: "Errands", badge: "A11y", variant: "accent" },
          { id: "support", label: "Support" },
        ]}
        value={["errands", "missing"]}
        onChange={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /service tags, 2 selected/i }),
      );
    });

    expect(
      screen.getByRole("listbox", { name: /service tags/i }),
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("MultiSelect chip removal and unlabeled state have no automated accessibility violations", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <MultiSelect
        options={[{ id: "support", label: "Support" }]}
        value={["support"]}
        onChange={onChange}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /remove support/i }));
    });

    expect(onChange).toHaveBeenCalledWith([]);
    await expectNoAxeViolations(container);
  });

  it("MultiSelect loading state has no automated accessibility violations", async () => {
    const { container } = render(
      <MultiSelect
        aria-label="Service tags"
        loading
        options={[{ id: "errands", label: "Errands" }]}
        value={[]}
        onChange={vi.fn()}
      />,
    );

    await expectNoAxeViolations(container);
  });

  it.each(["DRAFT", "PAUSED", "DELETED"] as const)(
    "MyListingCard %s state has no automated accessibility violations",
    async (publicationStatus) => {
      const { container } = render(
        <MyListingCard
          listing={{
            ...listing,
            listingId: `listing-${publicationStatus.toLowerCase()}`,
            publicationStatus,
            primaryMedia:
              publicationStatus === "DRAFT"
                ? undefined
                : {
                    ...listing.primaryMedia!,
                    altText: null,
                    altTextStatus: "PENDING",
                  },
          }}
          onEdit={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /edit/i }));
      await expectNoAxeViolations(container);
    },
  );

  it("Navbar login action remains accessible", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });

    const { container } = render(<Navbar />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    expect(window.location.href).toBe(
      "http://localhost:8081/auth/login/google",
    );
    await expectNoAxeViolations(container);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("Navbar logged-in state has no automated accessibility violations", async () => {
    useAuthStore.getState().setUser({
      userId: "user-1",
      username: "mira",
      firstName: "Mira",
      lastName: "Muster",
      userType: "PROVIDER",
      bio: null,
      simplifiedBio: null,
      selfSummary: null,
      accessibilityPreferences: [],
      profileMedia: {
        mediaId: "avatar-1",
        url: "/avatar.jpg",
        altTextStatus: "COMPLETED",
        mimeType: "image/jpeg",
        size: 1024,
        width: 200,
        height: 200,
        createdAt: "2026-06-14T00:00:00.000Z",
      },
      registrationComplete: true,
      isPublic: true,
      privateAddress: null,
    } satisfies User);

    const { container } = render(<Navbar />);
    await expectNoAxeViolations(container);
  });

  it("Popover keyboard and outside-click behavior has no automated accessibility violations", async () => {
    render(
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button>Open actions</Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content aria-label="Actions" align="start" sideOffset={4}>
            <Button>First</Button>
            <Button>Last</Button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /open actions/i }));
    });
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /actions/i }),
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole("button", { name: /last/i }).focus();
      fireEvent.keyDown(document, { key: "Tab" });
      fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(
      screen.queryByRole("dialog", { name: /actions/i }),
    ).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /open actions/i }));
    });
    await act(async () => {
      fireEvent.mouseDown(document.body);
    });

    expect(
      screen.queryByRole("dialog", { name: /actions/i }),
    ).not.toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });

  it("Slider disabled and controlled states have no automated accessibility violations", async () => {
    const onChange = vi.fn();
    const onChangeCommitted = vi.fn();
    const { container } = render(
      <div>
        <Slider label="Exact distance" min={10} max={10} disabled />
        <Slider
          label="Price"
          min={0}
          max={100}
          value={25}
          onChange={onChange}
          onChangeCommitted={onChangeCommitted}
        />
      </div>,
    );

    await act(async () => {
      const price = screen.getByRole("slider", { name: /price/i });
      fireEvent.change(price, { target: { value: "50" } });
      fireEvent.mouseUp(price);
      fireEvent.keyUp(price, { key: "Home" });
      fireEvent.keyUp(price, { key: "Tab" });
    });

    expect(onChange).toHaveBeenCalledWith(50);
    expect(onChangeCommitted).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("Switch checked state has no automated accessibility violations", async () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch.Root
        aria-label="Easy language"
        checked
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb />
      </Switch.Root>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("switch", { name: /easy language/i }));
    });

    expect(onCheckedChange).toHaveBeenCalledWith(false);
    await expectNoAxeViolations(container);
  });

  it("UserMenu non-provider state has no automated accessibility violations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    render(<UserMenu firstName="Mira" lastName="" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^mira$/i }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("dialog", { name: /user menu/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("link", { name: /my services/i }),
    ).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    });

    await expectNoAxeViolations(document.body);
  });

  it("BookingCard success actions and optional address states have no automated accessibility violations", async () => {
    const loadBookingDetails = vi.fn().mockResolvedValue({
      ...bookingDetails,
      serviceAddress: null,
      allowedActions: [
        {
          rel: "acknowledge-delivery",
          href: "/bookings/booking-1/acknowledge",
          method: "POST",
        },
        { rel: "cancel", href: "/bookings/booking-1/cancel", method: "POST" },
      ],
    });
    const onActionComplete = vi.fn();
    const { container } = render(
      <BookingCard
        booking={{
          ...bookingSummary,
          status: "AWAITING_CONFIRMATION",
          serviceAddress: null,
        }}
        mockDetail={{
          ...bookingDetails,
          serviceAddress: null,
          allowedActions: [
            {
              rel: "acknowledge-delivery",
              href: "/bookings/booking-1/acknowledge",
              method: "POST",
            },
            { rel: "cancel", href: "/bookings/booking-1/cancel", method: "POST" },
          ],
        }}
        onActionComplete={onActionComplete}
        loadBookingDetails={loadBookingDetails}
        performBookingAction={vi.fn().mockResolvedValue(null)}
      />,
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /expand booking details/i }),
      );
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /confirm service done/i }),
      );
    });
    await waitFor(() => expect(onActionComplete).toHaveBeenCalled());
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    });

    await expectNoAxeViolations(container);
  });

  it("Modal closed and no-focusable states have no automated accessibility violations", async () => {
    const closed = render(
      <Modal open={false} onClose={vi.fn()} title="Closed">
        <p>Closed content</p>
      </Modal>,
    );
    expect(closed.container).toBeEmptyDOMElement();
    closed.unmount();

    render(
      <Modal open onClose={vi.fn()} title="No actions">
        <p>Read-only message.</p>
      </Modal>,
    );
    await act(async () => {
      fireEvent.keyDown(document, { key: "Tab" });
      fireEvent.mouseDown(document.body);
    });
    await expectNoAxeViolations(document.body);
  });

  it("MyBookings filters and empty state have no automated accessibility violations", async () => {
    const bookings = [
      bookingSummary,
      { ...bookingSummary, bookingId: "booking-2", status: "CONFIRMED" as const },
      { ...bookingSummary, bookingId: "booking-3", status: "PAID" as const },
      { ...bookingSummary, bookingId: "booking-4", status: "COMPLETED" as const },
    ];
    const { container } = render(
      <MyBookings
        bookings={bookings}
        isProvider={false}
        loading={false}
        error={null}
        onActionComplete={vi.fn()}
        loadBookingDetails={vi.fn().mockResolvedValue(bookingDetails)}
        performBookingAction={vi.fn().mockResolvedValue(null)}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /to pay/i }));
      fireEvent.click(screen.getByRole("button", { name: /active/i }));
      fireEvent.click(screen.getByRole("button", { name: /past/i }));
    });

    await expectNoAxeViolations(container);
  });

  it("MyListings filter callback state has no automated accessibility violations", async () => {
    const onStatusFilterChange = vi.fn();
    const { container } = render(
      <MyListings
        listings={[]}
        statusFilter="DRAFT"
        statusCounts={{ ALL: 0, DRAFT: 0, ACTIVE: 0, PAUSED: 0, DELETED: 0 }}
        loading={false}
        error={null}
        hasPreviousPage
        hasNextPage={false}
        onStatusFilterChange={onStatusFilterChange}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onNextPage={vi.fn()}
        onPreviousPage={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /active/i }));
    });
    expect(onStatusFilterChange).toHaveBeenCalledWith("ACTIVE");
    await expectNoAxeViolations(container);
  });

  it("Registration validation edge states have no automated accessibility violations", async () => {
    const name = render(
      <RegisterName initialValues={null} onBack={vi.fn()} onContinue={vi.fn()} />,
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: "Mira1" },
      });
      fireEvent.blur(screen.getByLabelText(/first name/i));
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: "x".repeat(101) },
      });
      fireEvent.blur(screen.getByLabelText(/last name/i));
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "Mi" },
      });
      fireEvent.blur(screen.getByLabelText(/username/i));
    });
    await expectNoAxeViolations(name.container);
    name.unmount();

    const address = render(
      <RegisterAddress
        initialValues={null}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "Main 1" },
      });
      fireEvent.blur(screen.getByLabelText(/street/i));
      fireEvent.change(screen.getByLabelText(/house number/i), {
        target: { value: "x".repeat(11) },
      });
      fireEvent.blur(screen.getByLabelText(/house number/i));
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "abc12345" },
      });
      fireEvent.blur(screen.getByLabelText(/postal code/i));
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: "Berlin1" },
      });
      fireEvent.blur(screen.getByLabelText(/city/i));
    });
    await expectNoAxeViolations(address.container);
    address.unmount();

    const about = render(
      <RegisterAbout
        initialValues={{ userType: "CUSTOMER", selfSummary: null, bio: null }}
        onBack={vi.fn()}
        onContinue={vi.fn()}
      />,
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/about you/i), {
        target: { value: "x".repeat(2001) },
      });
      fireEvent.blur(screen.getByLabelText(/about you/i));
    });
    await expectNoAxeViolations(about.container);
  });

  it("RegisterPhoto and RegisterRole edge states have no automated accessibility violations", async () => {
    const photo = render(
      <RegisterPhoto
        initialValues={null}
        onBack={vi.fn()}
        onContinue={vi.fn().mockRejectedValue({ field: "file", message: "File failed." })}
      />,
    );
    const photoInput = screen.getByLabelText(/choose photo/i);
    await act(async () => {
      fireEvent.change(photoInput, { target: { files: [] } });
      fireEvent.change(photoInput, {
        target: {
          files: [
            new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", {
              type: "image/jpeg",
            }),
          ],
        },
      });
    });
    await expectNoAxeViolations(photo.container);
    photo.unmount();

    const role = render(
      <RegisterRole
        currentUserType="CUSTOMER"
        onContinue={vi.fn().mockRejectedValue({ field: "server", message: "Pick failed." })}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: /i can help/i }));
    });
    await waitFor(() => {
      expect(screen.getByText(/pick failed/i)).toBeInTheDocument();
    });
    await expectNoAxeViolations(role.container);
  });

  it("Home remaining controls have no automated accessibility violations", async () => {
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    const { container } = renderHome([]);

    await act(async () => {
      fireEvent.submit(screen.getByRole("search"));
      fireEvent.click(screen.getByRole("button", { name: /scroll categories left/i }));
      fireEvent.click(screen.getByRole("button", { name: /scroll listings right/i }));
    });

    expect(scrollBy).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("Small component branch states have no automated accessibility violations", async () => {
    const toggleChange = vi.fn();
    const { container } = render(
      <div>
        <SearchBar id="search-by-id" city="" />
        <ServiceUserToggle
          id="provider-toggle-checked"
          labelLeft="Customer"
          labelRight="Provider"
          checked
          onCheckedChange={toggleChange}
        />
        <MultiSelect
          id="empty-tags"
          aria-label="Empty tags"
          options={[]}
          value={[]}
          onChange={vi.fn()}
        />
      </div>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("switch"));
      fireEvent.click(screen.getByRole("button", { name: /empty tags/i }));
    });

    expect(toggleChange).toHaveBeenCalledWith(false);
    await expectNoAxeViolations(container);
  });

  it("WeeklyScheduleModal close and invalid time states have no automated accessibility violations", async () => {
    const onClose = vi.fn();
    render(
      <WeeklyScheduleModal
        open
        onClose={onClose}
        entries={scheduleEntries}
        isLoading={false}
        isSaving={false}
        errorMessage={null}
        onSave={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/monday start time/i), {
        target: { value: "18:00" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    });

    expect(onClose).toHaveBeenCalled();
    await expectNoAxeViolations(document.body);
  });

  it("EditListing polling and max validation states have no automated accessibility violations", async () => {
    vi.useFakeTimers();
    const onRefreshMedia = vi.fn().mockResolvedValue([
      {
        mediaId: "media-1",
        url: "/listing.jpg",
        altText: "Generated shopping bags",
        altTextStatus: "COMPLETED",
      },
    ]);
    const { container } = render(
      <EditListing
        listing={{
          ...editListing,
          media: [
            {
              mediaId: "media-1",
              position: 0,
              url: "/listing.jpg",
              altText: null,
              altTextStatus: "PROCESSING",
              mimeType: "image/jpeg",
              size: 1000,
              width: 800,
              height: 600,
              createdAt: "2026-01-01T00:00:00Z",
            },
          ],
        }}
        loadError={null}
        availableTags={serviceTags}
        tagsLoading={false}
        onBack={vi.fn()}
        onSubmit={vi.fn().mockRejectedValue(new Error("Save failed."))}
        onDelete={vi.fn()}
        onRemoveImage={vi.fn()}
        onStatusAction={vi.fn()}
        onRefreshMedia={onRefreshMedia}
      />,
    );

    expect(screen.getByLabelText(/generating description/i)).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(onRefreshMedia).toHaveBeenCalled();

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "x".repeat(121) },
      });
      fireEvent.blur(screen.getByLabelText(/title/i));
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "x".repeat(2001) },
      });
      fireEvent.blur(screen.getByLabelText(/description/i));
      fireEvent.change(screen.getByLabelText(/hourly rate/i), {
        target: { value: "" },
      });
      fireEvent.blur(screen.getByLabelText(/hourly rate/i));
      fireEvent.change(screen.getByLabelText(/street/i), {
        target: { value: "x".repeat(121) },
      });
      fireEvent.change(screen.getByLabelText(/^no\.$/i), {
        target: { value: "x".repeat(21) },
      });
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: "x".repeat(121) },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    });

    vi.useRealTimers();
    await waitFor(() => {
      expect(screen.getAllByText(/maximum 120 characters/i).length).toBeGreaterThan(0);
    });
    await expectNoAxeViolations(container);
  });

  it("CreateListing max validation and add image button states have no automated accessibility violations", async () => {
    const click = vi.fn();
    const { container } = render(
      <CreateListing
        availableTags={serviceTags}
        tagsLoading={false}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fileInput.click = click;

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "x".repeat(121) },
      });
      fireEvent.blur(screen.getByLabelText(/title/i));
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "x".repeat(2001) },
      });
      fireEvent.blur(screen.getByLabelText(/description/i));
      fireEvent.click(screen.getByRole("button", { name: /add new image/i }));
    });

    expect(click).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("ExceptionModal edit cancel state has no automated accessibility violations", async () => {
    render(
      <ExceptionModal
        open
        onClose={vi.fn()}
        exceptions={[
          {
            exceptionId: "exception-1",
            date: "2026-07-21",
            exceptionType: "AVAILABLE",
            startTime: "09:00:00",
            endTime: "12:00:00",
          },
        ]}
        isCreating
        errorMessage={null}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("tab", { name: /manage exceptions/i }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /edit times/i }));
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    });

    await expectNoAxeViolations(document.body);
  });
});
