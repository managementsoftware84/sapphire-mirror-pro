import { useSuspenseQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { homepageConfigQuery } from "@/lib/marketplace-content/siteQueries";

function iconFor(name: string) {
  const I = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return I ?? ShieldCheck;
}

/** Trust strip — items managed from the Marketplace Manager. */
const FeatureStrip = () => {
  const { data } = useSuspenseQuery(homepageConfigQuery());
  const items = (data?.features ?? []).filter((f) => f.visible);
  if (items.length === 0) return null;

  return (
    <div className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-md px-4 sm:px-6 lg:px-10 py-2">
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-white/80">
        {items.map((f) => {
          const Icon = iconFor(f.icon_name);
          return (
            <span key={f.id} className="flex items-center gap-1.5 whitespace-nowrap">
              <Icon className={`h-3.5 w-3.5 ${f.color_class} drop-shadow`} /> {f.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureStrip;
