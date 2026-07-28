import { createFileRoute } from "@tanstack/react-router";
import HomeIndex from "@/components/HomeIndex";
import { Toaster } from "sonner";
import { heroPublicQuery } from "@/lib/marketplace-content/heroQueries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Software Vala — 147 Software Solutions" },
      { name: "description", content: "Software Vala: 20 master categories and 147 software products with live demos. The Name of Trust." },
      { property: "og:title", content: "Software Vala — 147 Software Solutions" },
      { property: "og:description", content: "20 master categories, 147 products, 20 live demos. Lifetime access." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(heroPublicQuery()),
  component: Index,
});

function Index() {
  return (
    <>
      <HomeIndex />
      <Toaster position="top-right" richColors />
    </>
  );
}
