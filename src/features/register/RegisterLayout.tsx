import type { ReactNode } from "react";
import { Logo } from "../../common/ui/Logo";
import { Navbar } from "../../common/layout/Navbar";
import type { User } from "../../stores/auth";

const STEPS = [
  { path: "/register/role", label: "Choose role", optional: false },
  { path: "/register/name", label: "Your name", optional: false },
  { path: "/register/address", label: "Your address", optional: false },
  { path: "/register/about", label: "About you", optional: true },
  { path: "/register/photo", label: "Profile photo", optional: true },
] as const;

type StepStatus = "done" | "current" | "upcoming";

interface RegisterLayoutProps {
  user: User | null;
  pathname: string;
  children: ReactNode;
}

function getStepStatus(
  idx: number,
  user: User | null,
  pathname: string,
): StepStatus {
  if (STEPS[idx].path === pathname) return "current";
  if (!user) return "upcoming";

  const completedByData =
    (idx === 0 && !!user.userType) ||
    (idx === 1 && !!user.firstName && !!user.lastName && !!user.username) ||
    (idx === 2 && !!user.privateAddress) ||
    (idx === 3 && (!!user.bio || !!user.selfSummary)) ||
    (idx === 4 && !!user.profileMedia);

  if (completedByData) return "done";

  const step = STEPS[idx];
  if (step.optional) {
    if (pathname === "/register/done") return "done";
    const currentIdx = STEPS.findIndex((s) => s.path === pathname);
    if (currentIdx > idx) return "done";
  }

  return "upcoming";
}

export function RegisterLayout({
  user,
  pathname,
  children,
}: RegisterLayoutProps) {
  const currentStepIdx = STEPS.findIndex((s) => s.path === pathname);
  const stepNumber = currentStepIdx >= 0 ? currentStepIdx + 1 : 1;

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-background px-6 py-8">
        <div className="mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-[280px_1fr] bg-surface">
          <aside
            aria-label="Registration progress"
            className="bg-gradient-to-b from-primary to-accent p-8 flex flex-col gap-8 min-h-[560px]"
          >
            <div className="flex flex-col gap-3">
              <Logo variant="white" height={48} title="Mira" />
              <h1 className="font-heading text-3xl font-bold text-cream mt-2">
                Welcome to Mira
              </h1>
              <p className="text-small text-cream/80">
                A few quick steps to set up your account.
              </p>
            </div>

            <ol className="flex flex-col gap-4 list-none m-0 p-0">
              {STEPS.map((step, idx) => {
                const status = getStepStatus(idx, user, pathname);
                return (
                  <li key={step.path} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-label font-bold shrink-0 " +
                        (status === "done"
                          ? "bg-cream text-primary"
                          : status === "current"
                            ? "bg-cream text-accent ring-2 ring-cream/60"
                            : "bg-cream/25 text-cream")
                      }
                    >
                      {status === "done" ? "✓" : idx + 1}
                    </span>
                    <span
                      className={
                        "text-small " +
                        (status === "current"
                          ? "font-bold text-cream"
                          : status === "done"
                            ? "text-cream/90"
                            : "text-cream/70")
                      }
                    >
                      {step.label}
                      {step.optional && (
                        <span className="ml-1 text-cream/60">(optional)</span>
                      )}
                    </span>
                    <span className="sr-only">
                      {status === "done" && "Completed."}
                      {status === "current" && "Current step."}
                      {status === "upcoming" && "Not yet completed."}
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className="text-label text-cream/70 mt-auto" aria-live="polite">
              Step {stepNumber} of {STEPS.length}
            </p>
          </aside>

          <main
            id="main-content"
            className="p-8 bg-surface"
            aria-labelledby="register-step-heading"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
