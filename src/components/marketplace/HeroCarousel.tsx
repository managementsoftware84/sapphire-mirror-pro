import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Play, ChevronLeft, ChevronRight, ShoppingCart, Sparkles,
  Boxes, Crown, Rocket, Zap, ShieldCheck, Clock, BadgeCheck, Lock, Globe2,
  Utensils, GraduationCap, Stethoscope, Store, Users,
  type LucideIcon,
} from "lucide-react";
import { heroPublicQuery } from "@/lib/marketplace-content/heroQueries";

const ICONS: Record<string, LucideIcon> = {
  Boxes, Crown, Rocket, Sparkles, Utensils, GraduationCap, Stethoscope, Store, Users,
  ShoppingCart, Play, ShieldCheck, Clock, BadgeCheck, Lock, Globe2, Zap,
};

const HeroCarousel = () => {
  const { data: slides } = useSuspenseQuery(heroPublicQuery());
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const total = slides.length;
  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (total ? (prev + 1) % total : 0));
  }, [total]);
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (total ? (p - 1 + total) % total : 0));
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, paused, total]);

  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [current, total]);

  if (!total) return null;
  const product = slides[Math.min(current, total - 1)];
  const Icon = ICONS[product.icon_name] ?? Boxes;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 400 : -400, opacity: 0, rotateY: d > 0 ? 25 : -25, scale: 0.9 }),
    center: { x: 0, opacity: 1, rotateY: 0, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -400 : 400, opacity: 0, rotateY: d > 0 ? -25 : 25, scale: 0.9 }),
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ perspective: 1400 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative z-20 hidden md:flex border-b border-white/10 bg-black/40 backdrop-blur-md px-6 lg:px-10 py-2">
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-white/80">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300 drop-shadow" /> No Advance Payment</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyan-300 drop-shadow" /> 2-Hour Delivery</span>
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-amber-300 drop-shadow" /> No Hidden Charges</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-rose-300 drop-shadow" /> Trademark Protected</span>
          <span className="flex items-center gap-1.5"><Boxes className="h-3.5 w-3.5 text-violet-300 drop-shadow" /> 250 Solutions</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-fuchsia-300 drop-shadow" /> 20 Live Demos</span>
          <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5 text-sky-300 drop-shadow" /> Global Support</span>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={product.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`relative w-full bg-gradient-to-br ${product.gradient} py-20 sm:py-24 lg:py-32`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.45),transparent_55%)]" />
          <div className="absolute inset-0 bg-[conic-gradient(from_220deg_at_70%_30%,transparent_0deg,rgba(255,255,255,0.08)_60deg,transparent_120deg)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />

          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/25 blur-3xl"
              style={{ width: 90 + i * 34, height: 90 + i * 34, left: `${8 + i * 13}%`, top: `${12 + (i % 3) * 27}%` }}
              animate={{ y: [0, -24, 0], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}

          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220 }}
              className="mx-auto mb-5 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.35)]"
            >
              <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${product.accent} drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]`} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 mb-5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            >
              <Sparkles className="w-4 h-4 text-yellow-200 drop-shadow" />
              <span className="text-white text-xs font-bold tracking-[0.2em] uppercase drop-shadow">{product.kicker}</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] [text-shadow:0_2px_0_rgba(0,0,0,0.2)]"
            >
              {product.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-white/95 text-base sm:text-lg max-w-2xl mx-auto mb-8 drop-shadow-lg"
            >
              {product.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <a
                href={product.cta_link}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] border border-white/60"
              >
                <Play className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                {product.cta_primary}
              </a>
              <a
                href="/demos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/15 backdrop-blur-md text-white font-semibold border border-white/40 hover:bg-white/25 hover:scale-105 transition-all shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.cta_secondary}
              </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all shadow-2xl border border-white/20">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 hover:scale-110 transition-all shadow-2xl border border-white/20">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`h-2.5 rounded-full transition-all shadow-lg ${i === current ? "bg-white w-8" : "bg-white/40 w-2.5 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
