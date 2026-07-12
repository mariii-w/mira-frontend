import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { AppShell } from "../components/common/layout/AppShell";

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({
      children,
      to,
      className,
      activeProps,
      inactiveProps,
      onClick,
      ...rest
    }: {
      children: ReactNode;
      to: string;
      className?: string;
      activeProps?: { className?: string };
      inactiveProps?: { className?: string };
      onClick?: () => void;
    } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        href={to}
        className={
          className ?? inactiveProps?.className ?? activeProps?.className
        }
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    ),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../api/mira", () => ({
  logout: vi.fn().mockResolvedValue({ status: 204, data: undefined }),
  getListMyBookingsQueryKey: vi.fn((userId: string) => ["bookings", userId]),
  listMyBookings: vi
    .fn()
    .mockResolvedValue({ status: 200, data: { items: [] } }),
  getStartGoogleLoginUrl: vi.fn(
    () => "http://localhost:8081/auth/login/google",
  ),
  getPrivateUserProfile: vi.fn(),
}));

function renderAppShell(children: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppShell>{children}</AppShell>
    </QueryClientProvider>,
  );
}

describe("<AppShell />", () => {
  it("renders its children", () => {
    renderAppShell(<main data-testid="page-content">Page content</main>);
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders the shared navbar and footer chrome around the children", () => {
    renderAppShell(<div>content</div>);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
