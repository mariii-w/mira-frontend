import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  RegisterAddress,
  type RegisterAddressSubmitValues,
} from "../components/RegisterAddress";

describe("RegisterAddress", () => {
  it("submits the normalized address through the continue handler", async () => {
    const onContinue = vi
      .fn<(values: RegisterAddressSubmitValues) => Promise<void>>()
      .mockResolvedValue(undefined);

    render(
      <RegisterAddress
        initialValues={null}
        onBack={vi.fn()}
        onContinue={onContinue}
      />,
    );

    fireEvent.change(screen.getByLabelText(/street/i), {
      target: { value: "  Hauptstrasse  " },
    });
    fireEvent.change(screen.getByLabelText(/house number/i), {
      target: { value: " 43a " },
    });
    fireEvent.change(screen.getByLabelText(/postal code/i), {
      target: { value: "10115" },
    });
    fireEvent.change(screen.getByLabelText(/city/i), {
      target: { value: " Berlin " },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const expected: RegisterAddressSubmitValues = {
      street: "Hauptstrasse",
      houseNumber: "43a",
      postalCode: "10115",
      city: "Berlin",
    };

    await waitFor(() => expect(onContinue).toHaveBeenCalledWith(expected));
  });
});
