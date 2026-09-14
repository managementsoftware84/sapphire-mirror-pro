import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { X, PartyPopper, Tag } from "lucide-react";
import { homepageConfigQuery } from "@/lib/marketplace-content/siteQueries";

function iconFor(name: string) {
  const I = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return I ?? PartyPopper;
}

/**
 * Auto-sliding announcement banner.
 * Content, order, gradient, schedule and visibility are controlled from the
 * Marketplace Manager (announcements table) — no hardcoded copy.
 */
const FestiveBanner = () => {
  const { data } = useSuspenseQuery(homepageConfigQuery());
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => setNow(Date.now()), []);

  const all = data?.announcements ?? [];
  const items = all.filter((a) => {
    if (!a.visible) return false;
    if (now === null) return true; // SSR + first paint: schedule applied after mount
    if (a.starts_at && new Date(a.starts_at).getTime() > now) return false;
    if (a.ends_at && new Date(a.ends_at).getTime() < now) return false;
    return true;
  });

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 4200);
    return () => clearInterval(t);
  }, [items.length]);

  if (dismissed || items.length === 0) return null;
  const item = items[index % items.length];
  const Icon = iconFor(item.icon_name);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${item.gradient} py-3 sm:py-4 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]`}>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]"
            style={{ left: `${5 + i * 10}%`, top: `${15 + (i % 3) * 30}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 h-7 flex items-center justify-center text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <Icon className="w-5 h-5 flex-shrink-0 hidden sm:block drop-shadow-lg" />
            <span className="text-sm sm:text-base font-bold whitespace-nowrap drop-shadow">{item.title}</span>
            {item.badge && (
              <span className="px-2.5 py-1 rounded-md bg-white/25 backdrop-blur-sm text-sm sm:text-base font-black whitespace-nowrap shadow-inner border border-white/30">
                {item.badge}
              </span>
            )}
            <span className="text-sm hidden md:inline whitespace-nowrap drop-shadow">{item.text}</span>
            <Tag className="w-4 h-4 flex-shrink-0 hidden sm:block drop-shadow-lg" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 mt-2 flex items-center justify-center gap-1.5">
        {items.map((a, i) => (
          <button
            key={a.id}
            aria-label={`Announcement ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index % items.length ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
          />
        ))}
      </div>

      <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors border border-white/30">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default FestiveBanner;
