import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  RegisterName,
  type RegisterNameSubmitValues,
} from "../components/features/register/RegisterName";

describe("RegisterName", () => {
  it("submits normalized name values through the continue handler", async () => {
    const onContinue = vi
      .fn<(values: RegisterNameSubmitValues) => Promise<void>>()
      .mockResolvedValue(undefined);

    render(
      <RegisterName
        initialValues={null}
        onBack={vi.fn()}
        onContinue={onContinue}
      />,
    );

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "  Mira  " },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "  Muster  " },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "mira_123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const expected: RegisterNameSubmitValues = {
      firstName: "Mira",
      lastName: "Muster",
      username: "mira_123",
    };

    await waitFor(() => expect(onContinue).toHaveBeenCalledWith(expected));
  });

  it("shows username submit errors on the username input", async () => {
    const onContinue = vi
      .fn<(values: RegisterNameSubmitValues) => Promise<void>>()
      .mockRejectedValue({
        field: "username",
        message: "That username is already taken. Try another one.",
      });

    render(
      <RegisterName
        initialValues={{
          firstName: "Mira",
          lastName: "Muster",
          username: "mira_123",
        }}
        onBack={vi.fn()}
        onContinue={onContinue}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      await screen.findByText(
        "That username is already taken. Try another one.",
      ),
    ).toBeInTheDocument();
  });
});
