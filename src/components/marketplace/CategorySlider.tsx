import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { Sparkles, type LucideIcon } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogPublicQuery } from "@/lib/catalog/catalogQueries";
import { PRODUCT_ICONS } from "@/lib/catalog/productIcons";

interface Chip { icon: LucideIcon; name: string; color: string; link: string }

const CategorySlider = () => {
  // Content is managed end-to-end from the Marketplace Manager (master_categories).
  const { data } = useSuspenseQuery(catalogPublicQuery());
  const items = useMemo<Chip[]>(() => {
    const chips: Chip[] = [
      { icon: Sparkles, name: "All", color: "from-cyan-400 to-blue-600", link: "/#all" },
      ...data.categories
        .filter((c) => c.visible && c.featured)
        .map((c) => ({
          icon: PRODUCT_ICONS[c.icon_name] ?? Sparkles,
          name: c.name,
          color: c.gradient,
          link: `/#${encodeURIComponent(c.name)}`,
        })),
    ];
    return [...chips, ...chips];
  }, [data.categories]);

  // Butter-smooth GPU marquee: duplicate items, animate a single translateX,
  // wrap when the first copy has fully scrolled off.
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [halfWidth, setHalfWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const SPEED = 40; // px per second

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setHalfWidth(el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  useAnimationFrame((_, delta) => {
    if (paused || halfWidth <= 0) return;
    const next = x.get() - (SPEED * delta) / 1000;
    x.set(next <= -halfWidth ? next + halfWidth : next);
  });

  // Respect reduced-motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPaused(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section
      className="relative py-6 bg-gradient-to-b from-[#0a1628] via-[#0d1e36]/70 to-transparent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden px-4"
        style={{
          perspective: 1000,
          maskImage:
            "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
        }}
      >
        <motion.div
          ref={trackRef}
          style={{ x, willChange: "transform" }}
          className="flex gap-3 py-3 w-max"
        >
          {items.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <a
                key={`${cat.name}-${i}`}
                href={cat.link}
                className="flex-shrink-0"
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  whileHover={{ scale: 1.08, y: -4, rotateX: 8, rotateY: -8 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br ${cat.color} text-white text-sm font-bold whitespace-nowrap shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_-8px_rgba(0,0,0,0.6)] transition-shadow border border-white/25`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/10 to-white/30 pointer-events-none" />
                  <span className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-white/25 backdrop-blur-sm shadow-inner border border-white/30">
                    <Icon className="w-4 h-4 drop-shadow-lg" />
                  </span>
                  <span className="relative drop-shadow">{cat.name}</span>
                </motion.div>
              </a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySlider;