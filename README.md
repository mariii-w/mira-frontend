# Mira — Frontend

> Last updated: 2026-06-26

React + TypeScript frontend for the Mira platform. Built with Vite, Tailwind CSS v4, and TanStack Router.

## Questions

If you have any problems or questions, please feel free to contact us:

Phone: +49 173 8694827

Email: eganscha@hof-university.de

## Figma

<!-- Add Figma link here -->

> Figma: https://www.figma.com/team_invite/redeem/QpoqAiznfHhkXj0RcFp3mA?t=LY7aTlrFqH8Q7oG3-21

## Demo

Note: The server shuts down after about 15 minutes of inactivity and may take up to 1 minute to start again.

Please avoid excessive uploads or downloads, as we are using the free [Backblaze](https://www.backblaze.com/) tier. If you want to run load or limit tests, please contact us first so we can switch the S3 configuration to your own setup.

> Render: https://mira-uni-deploy.onrender.com/

## Stripe testing info

### Credit Card

```
Kartennummer: 4242 4242 4242 4242
Ablaufdatum: 12/34
CVC: 123
PLZ: 12345
Name: user name

E-Mail: user@example.com
```

---

## Accessibility

The project follows WCAG 2.1 AA as a baseline:

- Focus-visible styles applied globally via `:focus-visible`, with a fallback for older browsers
- `prefers-reduced-motion` media query disables all animations, with an in-app override toggle
- User-facing accessibility toggles — **Leichte Sprache** (easy-read German) and **Reduce motion** — accessible from the header `AccessibilityPanel`
- Preferences are persisted via the Zustand store (`stores/accessibility.ts`) and mirrored onto `<html data-easy-read>` / `<html data-reduced-motion>` so CSS reacts
- Custom `Popover`, `Switch`, and `Modal` primitives include full keyboard navigation (Tab, Shift+Tab, Escape) and ARIA wiring
- `Modal` traps focus inside the dialog while open, so Tab cycling stays within it, and restores focus to the triggering element on close. `Popover` follows the same pattern
- The booking `CalendarGrid` implements roving tabindex, so arrow keys, Home, and End move focus between date cells without leaving the grid
- Booking status and duration updates use `aria-live="polite"`. Credential visibility toggles and loading states use `role="status"` with `aria-live="polite"`
- Verified-credential badges (chat header, booking page, provider cards) use a `role="tooltip"` plus `aria-describedby` pattern, triggered by hover, focus, and keyboard alike
- `Input` and `Textarea` mark invalid fields with `aria-invalid`, link error text via `aria-describedby`, and announce errors with `role="alert"`. Required fields are flagged on `Label`
- Icon-only buttons require `aria-label` (enforced by a dev-mode warning), and decorative icons are marked `aria-hidden`
- Loading state uses `aria-busy` and a visually-hidden "Loading…" text. `sr-only` utility text supplements visual-only context throughout (dates, toggles, form labels)
- Semantic HTML throughout: `<nav>`, `<main>`, `<section>`, `<article>`, `<ul>`/`<li>` lists with `aria-labelledby` on every section
- Heading fonts use [Atkinson Hyperlegible](https://brailleinstitute.org/freefont), designed for low-vision readers

### Automated Accessibility Testing

Accessibility is not just checked by hand. The CI pipeline runs an automated [`axe-core`](https://github.com/dequelabs/axe-core) scan on every push and merge request:

- A dedicated suite (`src/__tests__/components.a11y.test.tsx`) runs axe checks against 20+ component states, including `CalendarGrid`, `Modal`, `BookingCard`, `BookingPage`, `Home`, and `CreateListing`
- It runs under its own Vitest config (`vite.a11y.config.ts`) via `npm run test:a11y`, as a separate `accessibility` stage in the pipeline alongside the regular unit tests
- A second pipeline stage, `accessibility-route-check`, fails the build if a route component renders raw HTML elements instead of the shared component library. This keeps markup running through the accessible, tested primitives instead of bypassing them

## Design System

### Design Tokens

Design tokens are defined in `src/globals.css` using Tailwind CSS v4's `@theme` block and are available as Tailwind utilities throughout the app.

#### Colors

| Token        | Hex       | Role                |
| ------------ | --------- | ------------------- |
| `forest`     | `#47745B` | Primary action      |
| `sage`       | `#6E9D82` | Secondary green     |
| `mint`       | `#EBF4EF` | Soft surface        |
| `plum`       | `#7C4E80` | Accent              |
| `lilac`      | `#B281B6` | Decorative          |
| `blush`      | `#F5EDF6` | Soft surface        |
| `charcoal`   | `#2E2E26` | Body text           |
| `grey-olive` | `#96928D` | Borders, muted text |
| `cream`      | `#F9F5F0` | Page background     |
| `linen`      | `#F2EBE1` | Alt surface         |

Semantic aliases (`background`, `foreground`, `primary`, `accent`, `surface`, `border`, `muted`) are also defined.

#### Typography

| Token   | Size       | Font                        |
| ------- | ---------- | --------------------------- |
| `h1`    | `2rem`     | Atkinson Hyperlegible (700) |
| `h2`    | `1.5rem`   | Atkinson Hyperlegible (700) |
| `body`  | `1rem`     | Lexend                      |
| `small` | `0.875rem` | Lexend                      |
| `label` | `0.75rem`  | Lexend (500)                |

#### Shape & Spacing

There is no custom spacing or radius scale in `@theme`. Both use Tailwind's default utilities, kept consistent by convention rather than a token:

- Radius: `rounded-lg` for most surfaces, `rounded-full` for pills and buttons, `rounded-2xl` for cards and modals
- Spacing: standard Tailwind scale (`p-3`/`p-4`, `gap-2`/`gap-3`, etc.)
- Breakpoints: Tailwind defaults (`sm`/`md`/`lg`/`xl`). `lg` (1024px) is the standard mobile/desktop cutoff app-wide

Icons are standardized on [lucide-react](https://lucide.dev) throughout.

---

## Developer Docs

<details>
<summary>More Info</summary>

### Getting Started

<details>
<summary>Start the Backend</summary>

```sh
# stripe
stripe login
stripe listen --forward-to localhost:8081/v1/stripe/webhook

# Server

export GOOGLE_CLIENT_ID=
export GOOGLE_CLIENT_SECRET=
export LISA_API_TOKEN=
export OPENCAGE_API_KEY=
export STRIPE_SECRET_KEY=
export STRIPE_WEBHOOK_SECRET=
export AUTH_JWT_SECRET="replace-with-at-least-32-random-bytes"
export STRIPE_CHECKOUT_CANCEL_URL=http://localhost:5173/bookings/payment/cancelled
export STRIPE_CHECKOUT_SUCCESS_URL="http://localhost:5173/bookings/payment/success?session_id={CHECKOUT_SESSION_ID}"
export MIRA_MEDIA_S3_ENABLED=false
export TESTNIG=true
export MIRA_LOG=DEBUG
export MIRA_FILE_LOG_ENABLED=true
export MIRA_DEMO_SKIP_GOOGLE_ID_TOKEN_SIGNATURE=false
export MIRA_POST_LOGIN_REDIRECT_URL=http://localhost:5173/login
# in memory db(delete after shutdown)

java -jar ./backend.jar --spring.profiles.active=local-h2 --server.port=8081

# with postgres db

# install postgres with postgis a database named miradb & set username/password

export DATASOURCE_URL=jdbc:postgresql://localhost:5432/miradb
export DB_USERNAME=
export DB_PASSWORD=
java -jar ./backend.jar --spring.profiles.active=postgres --server.port=8081

```

</details>

> **Note:** `og:url` will be incorrect in development builds.  
> In production, the frontend and backend are served from the same server, but during development the frontend runs on a separate dev-server port.

> > Note: On some systems, STOMP may fail when using npm. If chat functionality does not work, try using pnpm instead by replacing npm commands with the equivalent pnpm commands.

```sh
VITE_API_BASE_URL=http://localhost:8081
npm install
npm run openapi
npm run dev
```

### Tech Stack

| Tool                                                                                                 | Version | Purpose                                                             |
| ---------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------- |
| [React](https://react.dev)                                                                           | 19      | UI library                                                          |
| [TypeScript](https://www.typescriptlang.org)                                                         | 6       | Type safety                                                         |
| [Vite](https://vite.dev)                                                                             | 8       | Build tool & dev server                                             |
| [Tailwind CSS](https://tailwindcss.com)                                                              | 4       | Utility-first styling with `@theme` design tokens                   |
| [TanStack Router](https://tanstack.com/router)                                                       | 1       | File-based type-safe routing                                        |
| [Zustand](https://zustand.docs.pmnd.rs)                                                              | 5       | Lightweight global state with `persist` middleware for localStorage |
| [Lucide React](https://lucide.dev)                                                                   | latest  | Icon library                                                        |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | latest  | Conditional class merging                                           |
| [Vitest](https://vitest.dev)                                                                         | 4       | Unit testing                                                        |
| [Testing Library](https://testing-library.com)                                                       | 16      | Component testing utilities                                         |

---

### CI/CD Pipeline

The project uses **GitLab CI** (`.gitlab-ci.yml`). The pipeline runs on every push and merge request across six sequential stages, all on the `node:22` Docker image.

```
push / MR
    │
    ├── build                       npm run build
    │
    ├── test                        npm run test:ci
    │
    ├── accessibility-route-check   npm run check:routes-no-html
    │
    ├── accessibility               npm run test:a11y
    │
    ├── lint                        npm run lint
    │
    └── release (tags only)         publish
```

The `accessibility-route-check` and `accessibility` stages were added after the initial build/test setup, as part of the accessibility work described above. The `feature/runner-test` branch was used to verify the GitLab Runner was connected and working before wiring up the real jobs.

#### Pipeline jobs

| Job                          | Stage                       | Command                       | Purpose                                                      |
| ----------------------------- | ---------------------------- | ------------------------------ | -------------------------------------------------------------- |
| `build`                      | build                        | `npm run build`               | TypeScript check and Vite production build                    |
| `test`                       | test                          | `npm run test:ci`             | Vitest unit tests with V8 coverage                             |
| `accessibility-route-check`  | accessibility-route-check    | `npm run check:routes-no-html`| Fails if a route renders raw HTML instead of shared components |
| `accessibility`              | accessibility                 | `npm run test:a11y`           | Axe-core accessibility scans, with their own coverage report  |
| `lint`                       | lint                          | `npm run lint`                | ESLint                                                         |
| `publish`                    | release                       | `./publish`                   | Builds and publishes a Docker image, tagged releases only     |

---

### Branch Strategy

| Branch    | Purpose                                                    |
| --------- | ---------------------------------------------------------- |
| `main`    | Production-ready code                                      |
| `dev`     | Integration branch — all feature branches merge here first |
| `sprint*` | Each sprint                                                |

</details>
