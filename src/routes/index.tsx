import { createFileRoute } from "@tanstack/react-router";
import { getPublicListings } from "../api/mira";
import { Home } from "../components/Home";
import type { PublicListingSummary } from "../api/model";

interface HomeLoaderData {
  featuredListings: PublicListingSummary[];
}

/* eslint-disable react-refresh/only-export-components */
export const Route = createFileRoute("/")({
  loader: loadHome,
  component: HomeRoute,
});

async function loadHome(): Promise<HomeLoaderData> {
  try {
    const response = await getPublicListings({ limit: 8 });

    if (response.status !== 200) {
      return { featuredListings: [] };
    }

    return { featuredListings: response.data.items };
  } catch {
    return { featuredListings: [] };
  }
}

function HomeRoute() {
  const { featuredListings } = Route.useLoaderData();

  return <Home featuredListings={featuredListings} />;
}
