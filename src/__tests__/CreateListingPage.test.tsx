import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";


vi.mock("../common/ui/MultiSelect", () => ({
  MultiSelect: ({
    onChange,
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
      onClick={() => onChange(["tag-1"])}
    >
      Select tags
    </button>
  ),
}));

import { CreateListing } from "../features/listings/CreateListing";
import type { MultiSelectProps } from "../common/ui/MultiSelect";

const availableTags = [
  {
    tagId: "tag-1",
    name: "Computer help",
    isBarrierefrei: false,
    isActive: true,
  },
];

function renderCreateListing(
  props: Partial<ComponentProps<typeof CreateListing>> = {},
) {
  return render(
    <CreateListing
      availableTags={availableTags}
      tagsLoading={false}
      onBack={vi.fn()}
      onSubmit={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText(/title/i), {
    target: { value: "Valid Title Here" },
  });
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: "A valid description with enough text." },
  });
  fireEvent.change(screen.getByLabelText(/hourly rate/i), {
    target: { value: "25" },
  });
  fireEvent.change(screen.getByLabelText(/street/i), {
    target: { value: "Main Street" },
  });
  fireEvent.change(screen.getByLabelText(/no\./i), {
    target: { value: "12a" },
  });
  fireEvent.change(screen.getByLabelText(/postal code/i), {
    target: { value: "12345" },
  });
  fireEvent.change(screen.getByLabelText(/city/i), {
    target: { value: "Berlin" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("<CreateListing />", () => {
  it("renders all main form sections", () => {
    renderCreateListing();
    expect(
      screen.getByRole("heading", { name: "New Service" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hourly rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
  });

  it("shows required field errors when submitting an empty form", () => {
    renderCreateListing();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(7);
  });

  it("shows tag error when no tags are selected", () => {
    renderCreateListing();
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(screen.getByText("Select at least one tag.")).toBeInTheDocument();
  });

  it("does not call onSubmit when the form is invalid", () => {
    const onSubmit = vi.fn();
    renderCreateListing({ onSubmit });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows "Service is being saved…" while the request is pending', async () => {
    renderCreateListing({
      onSubmit: vi.fn().mockReturnValue(new Promise(() => {})),
    });
    fillForm();
    fireEvent.click(screen.getByTestId("multiselect"));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() =>
      expect(screen.getByText("Service is being saved…")).toBeInTheDocument(),
    );
  });

  it("calls onSubmit with normalized form values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderCreateListing({ onSubmit });
    fillForm();
    fireEvent.click(screen.getByTestId("multiselect"));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Valid Title Here",
      description: "A valid description with enough text.",
      price: 25,
      tagIds: ["tag-1"],
      location: {
        street: "Main Street",
        houseNumber: "12a",
        postalCode: "12345",
        city: "Berlin",
        serviceRadiusKm: 20,
      },
      imageFiles: [],
    });
  });

  it("calls onBack from the back button", () => {
    const onBack = vi.fn();
    renderCreateListing({ onBack });
    fireEvent.click(
      screen.getByRole("button", { name: /back to my services/i }),
    );
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows an error message when submission fails", async () => {
    renderCreateListing({
      onSubmit: vi.fn().mockRejectedValue(new Error("Something went wrong.")),
    });
    fillForm();
    fireEvent.click(screen.getByTestId("multiselect"));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Something went wrong.",
      ),
    );
  });
});
