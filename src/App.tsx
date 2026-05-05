import { Logo, type LogoVariant } from './components/Logo.tsx';

interface LogoSample {
  variant: LogoVariant;
  label: string;
  onDark?: boolean;
}

const LOGO_SAMPLES: LogoSample[] = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'stacked', label: 'Stacked' },
  { variant: 'submark', label: 'Submark' },
  { variant: 'icon', label: 'Icon' },
  { variant: 'black', label: 'Black' },
  { variant: 'white', label: 'White', onDark: true },
];

interface ColorSample {
  name: string;
  hex: string;
  role: string;
  dark?: boolean;
}

const COLOR_SAMPLES: ColorSample[] = [
  { name: 'Forest',     hex: '#47745B', role: 'Primary action',       dark: true },
  { name: 'Sage',       hex: '#6E9D82', role: 'Secondary green' },
  { name: 'Mint',       hex: '#EBF4EF', role: 'Soft surface' },
  { name: 'Plum',       hex: '#7C4E80', role: 'Accent',               dark: true },
  { name: 'Lilac',      hex: '#B281B6', role: 'Decorative only' },
  { name: 'Blush',      hex: '#F5EDF6', role: 'Soft surface' },
  { name: 'Charcoal',   hex: '#2E2E26', role: 'Body text',            dark: true },
  { name: 'Grey Olive', hex: '#96928D', role: 'Borders, muted text' },
  { name: 'Linen',      hex: '#F2EBE1', role: 'Alt surface' },
  { name: 'Cream',      hex: '#F9F5F0', role: 'Page background' },
];

function App() {
  return (
    <>
      <a
        href="#main"
        className="absolute -top-24 left-4 z-50 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold no-underline focus:top-4"
      >
        Skip to content
      </a>

      <main id="main" className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-12">
        <header className="flex flex-col items-start gap-4 pb-8 border-b border-border">
          <Logo variant="primary" height={56} title="Mira home" />
        </header>

        <section className="flex flex-col gap-5" aria-labelledby="logos-heading">
          <h2 id="logos-heading">Logos</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {LOGO_SAMPLES.map(({ variant, label, onDark }) => (
              <figure key={variant} className="m-0 flex flex-col gap-2">
                <div
                  className={`flex items-center justify-center h-30 p-4 rounded-lg border ${
                    onDark
                      ? 'bg-charcoal border-charcoal'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Logo variant={variant} height={48} />
                </div>
                <figcaption className="text-small text-muted">{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="colors-heading">
          <h2 id="colors-heading">Colors</h2>
          <ul className="list-none m-0 p-0 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
            {COLOR_SAMPLES.map(({ name, hex, role, dark }) => (
              <li
                key={hex}
                className={`flex flex-col gap-1 min-h-30 p-4 rounded-lg border ${
                  dark ? 'text-cream border-transparent' : 'text-foreground border-border'
                }`}
                style={{ background: hex }}
              >
                <strong className="font-heading font-bold">{name}</strong>
                <code className="bg-transparent p-0 text-small opacity-85">{hex}</code>
                <small className="mt-auto text-label opacity-85">{role}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="type-heading">
          <h2 id="type-heading">Typography</h2>
          <div className="flex flex-col gap-4 p-6 bg-surface border border-border rounded-lg">
            <h1>H1 — Find help near you</h1>
            <h2>H2 — Available providers near Munich</h2>
            <p>
              Body — Helps with Windows, printers, Wi-Fi setup, and phone issues.
              Patient and friendly with first-time users and seniors.
            </p>
            <p className="text-small text-muted">
              Small — Available today · Brussels, Belgium · 4.9 ★ (38 reviews) · From €20/hr
            </p>
            <span className="inline-block text-label uppercase tracking-wider text-muted">
              Label — Tags, badges
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="components-heading">
          <h2 id="components-heading">Sample components</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="font-body text-body font-semibold leading-none min-h-11 px-5 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Book now
            </button>
            <button
              type="button"
              className="font-body text-body font-semibold leading-none min-h-11 px-5 py-3 rounded-full bg-mint text-primary hover:bg-blush hover:text-accent transition-colors"
            >
              PC Support
            </button>
            <a href="#main" className="font-medium">
              A focusable link
            </a>
          </div>
          <p className="text-small text-muted">
            Tab through the controls above to verify keyboard focus rings.
          </p>
        </section>
      </main>
    </>
  );
}

export default App;
