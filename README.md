# Mira — Frontend

> Last updated: 2026-05-10

React + TypeScript frontend for the Mira platform. Built with Vite, Tailwind CSS v4, and TanStack Router.

## Design

<!-- Add Figma link here -->
> Figma: https://www.figma.com/design/DDBQZwK4QjCup1GH4OblFu/Design?node-id=240-1053&t=Mxw89tVCKZcrnzMo-1

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [React](https://react.dev) | 19 | UI library |
| [TypeScript](https://www.typescriptlang.org) | 6 | Type safety |
| [Vite](https://vite.dev) | 8 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling with `@theme` design tokens |
| [TanStack Router](https://tanstack.com/router) | 1 | File-based type-safe routing |
| [Zustand](https://zustand.docs.pmnd.rs) | 5 | Lightweight global state with `persist` middleware for localStorage |
| [Lucide React](https://lucide.dev) | latest | Icon library |
| [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | latest | Conditional class merging |
| [Vitest](https://vitest.dev) | 4 | Unit testing |
| [Testing Library](https://testing-library.com) | 16 | Component testing utilities |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

### Installation

```bash
# Clone the repo
git clone https://gitlab.hof-university.de/eganscha/mudkip-project.git
cd mudkip-project

# Install dependencies
npm ci
```

### Development

```bash
npm run dev
```

Opens the dev server at `http://localhost:5173` with HMR enabled.

### Build

```bash
npm run build
```

Runs TypeScript type-checking (`tsc -b`) followed by the Vite production build. Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

Runs ESLint across all `.ts` / `.tsx` files.

### Tests

```bash
# Watch mode (local development)
npm run test

# Single run with coverage report (used in CI)
npm run test:ci
```

Coverage is collected via `@vitest/coverage-v8`.

---

## Project Structure

```
src/
├── __tests__/           # Unit tests (Vitest + Testing Library)
├── assets/
│   └── logos/           # SVG logo variants (primary, stacked, submark, icon, black, white)
├── components/          # Shared UI components (Button, Pagination, Popover, Switch, …)
├── lib/
│   └── cn.ts            # clsx + tailwind-merge helper
├── routes/              # File-based routes (TanStack Router)
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Landing page (/)
│   └── styleguide.tsx   # Design system showcase (/styleguide)
├── stores/
│   └── accessibility.ts # Zustand store for accessibility prefs (persisted to localStorage)
├── globals.css          # Tailwind @theme tokens, base styles, reduced-motion rules
├── main.tsx             # App entry point
├── router.tsx           # Router setup
└── routeTree.gen.ts     # Auto-generated route tree (TanStack Router plugin)
```

---

## Design Tokens

Design tokens are defined in `src/globals.css` using Tailwind CSS v4's `@theme` block and are available as Tailwind utilities throughout the app.

### Colors

| Token | Hex | Role |
|-------|-----|------|
| `forest` | `#47745B` | Primary action |
| `sage` | `#6E9D82` | Secondary green |
| `mint` | `#EBF4EF` | Soft surface |
| `plum` | `#7C4E80` | Accent |
| `lilac` | `#B281B6` | Decorative |
| `blush` | `#F5EDF6` | Soft surface |
| `charcoal` | `#2E2E26` | Body text |
| `grey-olive` | `#96928D` | Borders, muted text |
| `cream` | `#F9F5F0` | Page background |
| `linen` | `#F2EBE1` | Alt surface |

Semantic aliases (`background`, `foreground`, `primary`, `accent`, `surface`, `border`, `muted`) are also defined.

### Typography

| Token | Size | Font |
|-------|------|------|
| `h1` | `2rem` | Atkinson Hyperlegible (700) |
| `h2` | `1.5rem` | Atkinson Hyperlegible (700) |
| `body` | `1rem` | Lexend |
| `small` | `0.875rem` | Lexend |
| `label` | `0.75rem` | Lexend (500) |

---

## Routes

| Path | File | Purpose |
|------|------|---------|
| `/` | `routes/index.tsx` | Landing page — hero, how-it-works, popular categories, helpers near you, footer |
| `/styleguide` | `routes/styleguide.tsx` | Design system showcase — every component with live examples |

---

## Components

All components are showcased on the styleguide page (`/styleguide`).

| Component | Description |
|-----------|-------------|
| `Logo` | Mira logo in six variants: `primary`, `stacked`, `submark`, `icon`, `black`, `white` |
| `Button` | Accessible button — 5 variants (`primary`, `accent`, `secondary`, `ghost`, `icon`), 3 sizes, loading state, leading/trailing icon support |
| `Label` | Form label with optional required indicator |
| `Input` | Text input with label, error, and disabled states |
| `Textarea` | Multi-line text input with the same state API as Input |
| `Navbar` | Top navigation bar with logo, links, and CTA |
| `CategoryCard` | Card displaying a service category with image and title |
| `ProviderCard` | Provider listing card in compact and full variants |
| `Pagination` | Accessible pagination with ellipsis logic, prev/next, sibling window, `aria-current` |
| `Popover` | Custom accessible popover primitive — focus trap, Escape, click-outside, `role="dialog"` |
| `Switch` | Custom accessible on/off toggle — `role="switch"`, `aria-checked`, keyboard support |
| `AccessibilityPanel` | Header dropdown with toggles for **Leichte Sprache** and **Reduce motion**; preferences are persisted via the Zustand store |

---

## CI/CD Pipeline

The project uses **GitLab CI** (`.gitlab-ci.yml`). The pipeline runs on every push and merge request and has two sequential stages.

```
push / MR
    │
    ├── build   →  npm ci && npm run build
    │
    └── test    →  npm ci && npm run test:ci
```

Both jobs run on the `node:22` Docker image.

The `feature/runner-test` branch was used to verify the GitLab Runner was connected and working before wiring up real build and test jobs.

### Pipeline jobs

| Job | Stage | Command | Purpose |
|-----|-------|---------|---------|
| `build` | build | `npm ci && npm run build` | TypeScript check + Vite production build |
| `test` | test | `npm ci && npm run test:ci` | Vitest unit tests with V8 coverage |

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Integration branch — all feature branches merge here first |
| `feat/*` | Individual feature or component work |
| `feature/runner-test` | One-off branch used to smoke-test the GitLab Runner |

---

## Accessibility

The project follows WCAG 2.1 AA as a baseline:

- Focus-visible styles applied globally via `:focus-visible`, with a fallback for older browsers
- `prefers-reduced-motion` media query disables all animations, with an in-app override toggle
- User-facing accessibility toggles — **Leichte Sprache** (easy-read German) and **Reduce motion** — accessible from the header `AccessibilityPanel`
- Preferences are persisted via the Zustand store (`stores/accessibility.ts`) and mirrored onto `<html data-easy-read>` / `<html data-reduced-motion>` so CSS reacts
- Custom `Popover` and `Switch` primitives include full keyboard navigation (Tab, Shift+Tab, Escape) and ARIA wiring
- Icon-only buttons require `aria-label` (enforced by a dev-mode warning)
- Loading state uses `aria-busy` and a visually-hidden "Loading…" text
- Semantic HTML throughout: `<nav>`, `<main>`, `<section>`, `<article>`, `<ul>`/`<li>` lists with `aria-labelledby` on every section
- Heading fonts use [Atkinson Hyperlegible](https://brailleinstitute.org/freefont), designed for low-vision readers
