type MetaInput = {
  title: string;
  description?: string;
  path?: string;
  url?: string;
};

// Serverd by the backend in deployment so its fine
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

export function createPageMeta({ title, description, path, url }: MetaInput) {
  const siteName = "Mira";
  const fullTitle = `${title} – ${siteName}`;
  const canonicalUrl = url ?? (path ? `${BASE_URL}${path}` : undefined);
  return {
    meta: [
      {
        title: fullTitle,
      },
      ...(description
        ? [
            {
              name: "description",
              content: description,
            },
            {
              property: "og:description",
              content: description,
            },
          ]
        : []),
      {
        property: "og:title",
        content: fullTitle,
      },
      ...(canonicalUrl
        ? [
            {
              property: "og:url",
              content: canonicalUrl,
            },
          ]
        : []),
    ],
    links: canonicalUrl
      ? [
          {
            rel: "canonical",
            href: canonicalUrl,
          },
        ]
      : [],
  };
}
