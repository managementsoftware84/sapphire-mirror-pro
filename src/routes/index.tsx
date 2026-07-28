import { createFileRoute } from "@tanstack/react-router";
import HomeIndex from "@/components/HomeIndex";
import { Toaster } from "sonner";
import { heroPublicQuery } from "@/lib/marketplace-content/heroQueries";
import { catalogPublicQuery } from "@/lib/catalog/catalogQueries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Software Vala — 250 Software Solutions Across 57 Industries" },
      { name: "description", content: "Software Vala: 57 master categories and 250 software products with 20 live demos. Lifetime access, free installation, 1 year support. The Name of Trust." },
      { property: "og:title", content: "Software Vala — 250 Software Solutions Across 57 Industries" },
      { property: "og:description", content: "57 master categories, 250 products, 20 live demos. Lifetime access starting $249." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(heroPublicQuery()),
      context.queryClient.ensureQueryData(catalogPublicQuery()),
    ]);
  },
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
