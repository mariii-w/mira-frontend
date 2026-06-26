import { Accessibility } from "lucide-react";
import type { InfoPageContent } from "./infoPages";

function sectionId(title: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-heading`;
}

export function InfoPage({ page }: { page: InfoPageContent }) {
  return (
    <div className="min-h-dvh bg-background">
      <main id="main-content" className="mx-auto flex max-w-4xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4">
          <p className="text-label font-semibold uppercase tracking-widest text-primary">
            Mira information
          </p>
          <h1 className="text-h1 font-heading font-bold text-foreground">{page.title}</h1>
          <p className="max-w-3xl text-body text-muted">{page.intro}</p>
        </header>

        <div className="flex flex-col gap-8">
          {page.sections.map((section) => (
            <section key={section.title} aria-labelledby={sectionId(section.title)}>
              <h2
                id={sectionId(section.title)}
                className="flex items-center gap-2 text-h2 font-heading font-semibold text-foreground"
              >
                {section.title === "Accessibility panel" && (
                  <Accessibility size={24} aria-hidden="true" className="shrink-0" />
                )}
                {section.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph) => (
                  <p
                    key={typeof paragraph === "string" ? paragraph : paragraph.email}
                    className="text-body leading-relaxed text-foreground"
                  >
                    {typeof paragraph === "string" ? (
                      paragraph
                    ) : (
                      <>
                        {paragraph.text}{" "}
                        <a
                          href={`mailto:${paragraph.email}`}
                          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {paragraph.email}
                        </a>
                      </>
                    )}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
