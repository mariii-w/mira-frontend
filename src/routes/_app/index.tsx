import { createFileRoute } from "@tanstack/react-router";
import { Home } from "../../components/features/home/Home";

export const Route = createFileRoute("/_app/")({
  component: Home,
});
