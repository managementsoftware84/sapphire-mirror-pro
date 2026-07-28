import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceManagerModule } from "@/components/marketplace-manager/MarketplaceManagerModule";

export const Route = createFileRoute("/marketplace-manager")({
  head: () => ({
    meta: [
      { title: "Marketplace Manager — Software Vala Boss Panel" },
      { name: "description", content: "Boss Panel to manage the Software Vala Marketplace: hero, walls, categories, cards, SEO, analytics, deployment and integrity." },
      { property: "og:title", content: "Marketplace Manager — Software Vala Boss Panel" },
      { property: "og:description", content: "Operator console for the Software Vala Marketplace." },
    ],
  }),
  component: MarketplaceManagerPage,
});

function MarketplaceManagerPage() {
  return <MarketplaceManagerModule />;
}
