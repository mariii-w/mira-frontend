import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockFetch = vi.fn();

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    createFileRoute: () => (config: unknown) => ({
      ...(config as object),
      useParams: () => ({ listingId: "listing-1" }),
    }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../stores/auth", () => ({
  useAuthStore: (selector: (s: { user: { userId: string } }) => unknown) =>
    selector({ user: { userId: "user-1" } }),
  get_access_token: vi.fn().mockResolvedValue("access-token"),
}));

vi.mock("../api/mira", () => ({
  getAuthorListing: vi.fn(
    (userId: string, listingId: string, options?: RequestInit) =>
      mockFetch(`/v1/users/${userId}/listings/${listingId}`, {
        ...options,
        method: "GET",
      }),
  ),
  getServiceTags: vi.fn(() => mockFetch("/v1/service-tags", { method: "GET" })),
  updateListing: vi.fn(
    (listingId: string, data: unknown, options?: RequestInit) =>
      mockFetch(`/v1/listings/${listingId}`, {
        ...options,
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  ),
  uploadListingMedia: vi.fn(
    (listingId: string, data: { files: File[] }, options?: RequestInit) =>
      mockFetch(`/v1/listings/${listingId}/media`, {
        ...options,
        method: "POST",
        body: data,
      }),
  ),
  publishListing: vi.fn(
    (listingId: string, options?: RequestInit) =>
      mockFetch(`/v1/listings/${listingId}/publish`, {
        ...options,
        method: "POST",
      }),
  ),
  pauseListing: vi.fn(
    (listingId: string, options?: RequestInit) =>
      mockFetch(`/v1/listings/${listingId}/pause`, {
        ...options,
        method: "POST",
      }),
  ),
  resumeListing: vi.fn(
    (listingId: string, options?: RequestInit) =>
      mockFetch(`/v1/listings/${listingId}/resume`, {
        ...options,
        method: "POST",
      }),
  ),
  deleteListing: vi.fn((listingId: string, options?: RequestInit) =>
    mockFetch(`/v1/listings/${listingId}`, { ...options, method: "DELETE" }),
  ),
  deleteListingMedia: vi.fn(
    (listingId: string, mediaId: string, options?: RequestInit) =>
      mockFetch(`/v1/listings/${listingId}/media/${mediaId}`, {
        ...options,
        method: "DELETE",
      }),
  ),
  getAvailability: vi.fn(() =>
    Promise.resolve({ status: 200, data: { days: [] } }),
  ),
  getPublicListings: vi.fn(() =>
    Promise.resolve({ status: 200, data: { items: [] } }),
  ),
}));

vi.mock("../components/Navbar", () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

vi.mock("../components/MultiSelect", () => ({
  MultiSelect: ({
    onChange,
    value,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": describedby,
  }: MultiSelectProps) => (
    <button
      type="button"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={describedby}
      data-testid="multiselect"
      onClick={() => onChange([...value, "tag-1"])}
    >
      Select tags
    </button>
  ),
}));

import { EditListingPage } from "../routes/edit-listing.$listingId";
import type { MultiSelectProps } from "../components/MultiSelect";

type PublicationStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "DELETED";

function makeListing(
  overrides: { publicationStatus?: PublicationStatus; tags?: object[] } = {},
) {
  return {
    listingId: "listing-1",
    title: "PC Help",
    description: "I help with your computer.",
    price: 25,
    publicationStatus: "ACTIVE" as PublicationStatus,
    tags: [
      { tagId: "tag-1", name: "IT", isBarrierefrei: false, isActive: true },
    ],
    location: { city: "Berlin", postalCode: "10115", serviceRadiusKm: 10 },
    author: { userId: "user-1", name: "Provider", surname: "Test" },
    ...overrides,
  };
}

function setupMocks(
  listing = makeListing(),
  media: unknown[] = [],
  actionOk = true,
) {
  mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
    const method = init?.method?.toUpperCase();
    if (method === "GET") {
      if (url === "/v1/service-tags") {
        return {
          status: 200,
          data: [
            {
              tagId: "tag-1",
              name: "IT",
              isBarrierefrei: false,
              isActive: true,
            },
          ],
        };
      }
      return { status: 200, data: { ...listing, media } };
    }
    if (actionOk) {
      return { status: method === "DELETE" ? 204 : 200, data: {} };
    }
    return {
      status: 400,
      data: { detail: "Action failed." },
    };
  });
}

function renderPage() {
  return render(<EditListingPage />);
}

async function waitForLoad() {
  await waitFor(() =>
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(screen.getByLabelText(/title/i)).toHaveValue("PC Help"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("<EditListingPage />", () => {
  it("shows loading state on mount", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows error when listing fetch fails", async () => {
    mockFetch.mockResolvedValue({ status: 404, data: {} });
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Failed to load listing.",
      ),
    );
  });

  it("renders the Edit Service heading after load", async () => {
    setupMocks();
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Edit Service" }),
      ).toBeInTheDocument(),
    );
  });

  it("pre-populates form fields from the fetched listing", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    expect(screen.getByLabelText(/title/i)).toHaveValue("PC Help");
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      "I help with your computer.",
    );
    expect(screen.getByLabelText(/hourly rate/i)).toHaveValue(25);
    expect(screen.getByLabelText(/city/i)).toHaveValue("Berlin");
    expect(screen.getByLabelText(/postal code/i)).toHaveValue("10115");
  });

  it("shows status badge", async () => {
    setupMocks();
    renderPage();
    await waitFor(() => expect(screen.getByText("Active")).toBeInTheDocument());
  });

  it("shows Save and Pause buttons for ACTIVE listing", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^pause$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /publish/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Save and Publish buttons for DRAFT listing", async () => {
    setupMocks(makeListing({ publicationStatus: "DRAFT" }));
    renderPage();
    await waitForLoad();
    expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^publish$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^pause$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Resume button and no Save button for PAUSED listing", async () => {
    setupMocks(makeListing({ publicationStatus: "PAUSED" }));
    renderPage();
    await waitForLoad();
    expect(
      screen.getByRole("button", { name: /^resume$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^save$/i }),
    ).not.toBeInTheDocument();
  });

  it("disables form fields for PAUSED listing", async () => {
    setupMocks(makeListing({ publicationStatus: "PAUSED" }));
    renderPage();
    await waitForLoad();
    expect(screen.getByLabelText(/title/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByLabelText(/hourly rate/i)).toBeDisabled();
  });

  it("back button navigates to /my-listings", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.click(
      screen.getByRole("button", { name: /back to my services/i }),
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" });
  });

  it("shows title validation error on empty submit", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByText("Required.")).toBeInTheDocument(),
    );
  });

  it("shows tag error when no tags are selected on submit", async () => {
    setupMocks(makeListing({ tags: [] }));
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByText("Select at least one tag.")).toBeInTheDocument(),
    );
  });

  it("does not call authFetch for PATCH when form is invalid", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    const patchCall = (mockFetch.mock.calls as [string, RequestInit?][]).find(
      ([, init]) => init?.method === "PATCH",
    );
    expect(patchCall).toBeUndefined();
  });

  it("sends PATCH to /v1/listings/:id with updated data on save", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Updated Title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => {
      const patchCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
        ([, init]) => init?.method === "PATCH",
      );
      expect(patchCall).toBeDefined();
    });

    const [url, init] = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([, init]) => init?.method === "PATCH",
    )!;
    expect(url).toBe("/v1/listings/listing-1");
    const body = JSON.parse(init.body as string);
    expect(body.title).toBe("Updated Title");
    expect(body.tagIds).toEqual(["tag-1"]);
  });

  it("navigates to /my-listings after successful save", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
    );
  });

  it("shows server error when save fails", async () => {
    setupMocks(makeListing(), [], false);
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Action failed."),
    );
  });

  it("calls publish endpoint and navigates on Publish click", async () => {
    setupMocks(makeListing({ publicationStatus: "DRAFT" }));
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /^publish$/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
    );
    const publishCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([url]) => String(url).includes("/publish"),
    );
    expect(publishCall).toBeDefined();
    expect(publishCall![1].method).toBe("POST");
  });

  it("calls pause endpoint and navigates on Pause click", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /^pause$/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
    );
    const pauseCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([url]) => String(url).includes("/pause"),
    );
    expect(pauseCall).toBeDefined();
    expect(pauseCall![1].method).toBe("POST");
  });

  it("calls resume endpoint and navigates on Resume click", async () => {
    setupMocks(makeListing({ publicationStatus: "PAUSED" }));
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /^resume$/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
    );
    const resumeCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([url]) => String(url).includes("/resume"),
    );
    expect(resumeCall).toBeDefined();
    expect(resumeCall![1].method).toBe("POST");
  });

  it("shows delete confirmation dialog when Delete service is clicked", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /delete service/i }));
    expect(
      screen.getByText("Are you sure? This cannot be undone."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /yes, delete/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^cancel$/i }),
    ).toBeInTheDocument();
  });

  it("hides delete confirmation when Cancel is clicked", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /delete service/i }));
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(
      screen.queryByText("Are you sure? This cannot be undone."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete service/i }),
    ).toBeInTheDocument();
  });

  it("sends DELETE to /v1/listings/:id and navigates after confirming deletion", async () => {
    setupMocks();
    renderPage();
    await waitForLoad();
    fireEvent.click(screen.getByRole("button", { name: /delete service/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
    );
    const deleteCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
      ([, init]) => init?.method === "DELETE",
    );
    expect(deleteCall).toBeDefined();
    expect(deleteCall![0]).toBe("/v1/listings/listing-1");
  });

  it("does not show delete button for DELETED listing", async () => {
    setupMocks(makeListing({ publicationStatus: "DELETED" }));
    renderPage();
    await waitForLoad();
    expect(
      screen.queryByRole("button", { name: /delete service/i }),
    ).not.toBeInTheDocument();
  });

  describe("preview", () => {
    it("shows Preview instead of Save in the header", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      expect(
        screen.getByRole("button", { name: /^preview$/i }),
      ).toBeInTheDocument();
    });

    it("groups Save next to Delete service instead of in the header", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      const saveButton = screen.getByRole("button", { name: /^save$/i });
      const deleteButton = screen.getByRole("button", {
        name: /delete service/i,
      });
      expect(saveButton.parentElement).toBe(deleteButton.parentElement);
    });

    it("opens the public-style preview when Preview is clicked", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByRole("button", { name: /^preview$/i }));
      expect(
        screen.getByText("Previewing — this is what customers will see"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "PC Help" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Edit Service" }),
      ).not.toBeInTheDocument();
    });

    it("returns to the edit form when Back to editing is clicked", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByRole("button", { name: /^preview$/i }));
      fireEvent.click(screen.getByRole("button", { name: /back to editing/i }));
      expect(
        screen.getByRole("heading", { name: "Edit Service" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue("PC Help");
    });
  });

  describe("validation", () => {
    it("shows description error when description is too short", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: "short" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
      await waitFor(() =>
        expect(screen.getByText("At least 10 characters.")).toBeInTheDocument(),
      );
    });

    it("shows price error when value is negative", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.change(screen.getByLabelText(/hourly rate/i), {
        target: { value: "-5" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
      await waitFor(() =>
        expect(
          screen.getByText("Must be a positive number."),
        ).toBeInTheDocument(),
      );
    });

    it("shows postal code error when format is invalid and address is started", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.change(screen.getByLabelText(/^street$/i), {
        target: { value: "Main St" },
      });
      fireEvent.change(screen.getByLabelText(/^no\./i), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/postal code/i), {
        target: { value: "1234" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
      await waitFor(() =>
        expect(
          screen.getByText("Must be exactly 5 digits."),
        ).toBeInTheDocument(),
      );
    });
  });

  describe("location in PATCH body", () => {
    it("excludes location when street and house number are empty", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
      );
      const patchCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
        ([, init]) => init?.method === "PATCH",
      )!;
      const body = JSON.parse(patchCall[1].body as string);
      expect(body.location).toBeUndefined();
    });

    it("includes location when street and house number are filled", async () => {
      setupMocks();
      renderPage();
      await waitForLoad();
      fireEvent.change(screen.getByLabelText(/^street$/i), {
        target: { value: "Main Street" },
      });
      fireEvent.change(screen.getByLabelText(/^no\./i), {
        target: { value: "12a" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith({ to: "/my-listings" }),
      );
      const patchCall = (mockFetch.mock.calls as [string, RequestInit][]).find(
        ([, init]) => init?.method === "PATCH",
      )!;
      const body = JSON.parse(patchCall[1].body as string);
      expect(body.location).toBeDefined();
      expect(body.location.street).toBe("Main Street");
      expect(body.location.houseNumber).toBe("12a");
      expect(body.location.city).toBe("Berlin");
      expect(body.location.postalCode).toBe("10115");
    });
  });

  describe("DELETED listing", () => {
    it("disables all form fields", async () => {
      setupMocks(makeListing({ publicationStatus: "DELETED" }));
      renderPage();
      await waitForLoad();
      expect(screen.getByLabelText(/title/i)).toBeDisabled();
      expect(screen.getByLabelText(/description/i)).toBeDisabled();
      expect(screen.getByLabelText(/hourly rate/i)).toBeDisabled();
    });

    it("shows no action or delete buttons", async () => {
      setupMocks(makeListing({ publicationStatus: "DELETED" }));
      renderPage();
      await waitForLoad();
      expect(
        screen.queryByRole("button", { name: /^save$/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /publish|pause|resume/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /delete service/i }),
      ).not.toBeInTheDocument();
    });

    it("hides the images section", async () => {
      setupMocks(makeListing({ publicationStatus: "DELETED" }));
      renderPage();
      await waitForLoad();
      expect(
        screen.queryByRole("list", { name: /listing images/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("images", () => {
    it("renders existing images loaded from the media endpoint", async () => {
      const media = [
        {
          mediaId: "media-1",
          url: "https://example.com/img1.jpg",
          altText: "Cat photo",
        },
        {
          mediaId: "media-2",
          url: "https://example.com/img2.jpg",
          altText: null,
        },
      ];
      setupMocks(makeListing(), media);
      renderPage();
      await waitForLoad();
      expect(
        screen.getByRole("img", { name: "Cat photo" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("calls DELETE on the media endpoint when an existing image is removed", async () => {
      const media = [
        {
          mediaId: "media-1",
          url: "https://example.com/img1.jpg",
          altText: "Cat photo",
        },
      ];
      setupMocks(makeListing(), media);
      renderPage();
      await waitForLoad();
      fireEvent.click(
        screen.getByRole("button", { name: /remove image: cat photo/i }),
      );
      await waitFor(() => {
        const deleteCall = (
          mockFetch.mock.calls as [string, RequestInit][]
        ).find(
          ([url, init]) =>
            String(url).includes("/media/media-1") && init?.method === "DELETE",
        );
        expect(deleteCall).toBeDefined();
      });
    });
  });

  describe("server errors on status actions", () => {
    it("shows server error when publish fails", async () => {
      setupMocks(makeListing({ publicationStatus: "DRAFT" }), [], false);
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByRole("button", { name: /^publish$/i }));
      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent("Action failed."),
      );
    });

    it("shows server error and dismisses confirmation when delete fails", async () => {
      setupMocks(makeListing(), [], false);
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByRole("button", { name: /delete service/i }));
      fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
      await waitFor(() =>
        expect(screen.getByRole("alert")).toHaveTextContent("Action failed."),
      );
      expect(
        screen.queryByText("Are you sure? This cannot be undone."),
      ).not.toBeInTheDocument();
    });
  });
});
