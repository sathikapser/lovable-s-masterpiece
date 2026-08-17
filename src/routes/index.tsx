import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/frontend/pages/login-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — TollGrid Vision Control" },
      {
        name: "description",
        content:
          "Operator sign in for TollGrid, the AI-powered toll booth vehicle detection and traffic-flow dashboard.",
      },
      { property: "og:title", content: "Sign in — TollGrid Vision Control" },
      {
        property: "og:description",
        content: "Secure operator access to lane-level vehicle detection and counting.",
      },
    ],
  }),
  component: LoginPage,
});
