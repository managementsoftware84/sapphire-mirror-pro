import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import {
  Sparkles, GraduationCap, Stethoscope, Utensils, Hotel, Home, Car, Plane,
  CreditCard, Factory, Users, Truck, Building, Megaphone, Wallet, Briefcase,
  ShoppingBag, Scale, Shield, Server, Headphones, Building2
} from "lucide-react";

const CATEGORIES = [
  { icon: Sparkles, name: "All", color: "from-cyan-400 to-blue-600", link: "/#all" },
  { icon: GraduationCap, name: "Education", color: "from-blue-500 to-indigo-600", link: "/#Education" },
  { icon: Stethoscope, name: "Healthcare", color: "from-pink-500 to-rose-600", link: "/#Healthcare" },
  { icon: Utensils, name: "Restaurant & POS", color: "from-orange-500 to-red-500", link: "/#Retail%20%26%20POS" },
  { icon: ShoppingBag, name: "Retail & POS", color: "from-amber-500 to-orange-600", link: "/#Retail%20%26%20POS" },
  { icon: Hotel, name: "Hotel & Hospitality", color: "from-fuchsia-500 to-pink-600" , link: "/#Hospitality" },
  { icon: Home, name: "Real Estate", color: "from-amber-500 to-yellow-600", link: "/#Real%20Estate" },
  { icon: Car, name: "Automotive", color: "from-red-500 to-orange-600", link: "/#Automotive" },
  { icon: Plane, name: "Travel", color: "from-sky-500 to-cyan-600", link: "/#Travel" },
  { icon: CreditCard, name: "Finance", color: "from-emerald-500 to-teal-600", link: "/#Finance" },
  { icon: Wallet, name: "Accounting", color: "from-lime-500 to-green-600", link: "/#Accounting" },
  { icon: Megaphone, name: "Marketing", color: "from-rose-500 to-red-600", link: "/#Marketing" },
  { icon: Users, name: "Sales & CRM", color: "from-violet-500 to-purple-600", link: "/#Sales%20%26%20CRM" },
  { icon: Briefcase, name: "HR", color: "from-indigo-500 to-blue-600", link: "/#HR" },
  { icon: Truck, name: "Logistics", color: "from-cyan-500 to-teal-600", link: "/#Logistics" },
  { icon: Factory, name: "Manufacturing", color: "from-blue-500 to-cyan-600", link: "/#Manufacturing" },
  { icon: Building, name: "Enterprise", color: "from-blue-600 to-indigo-800", link: "/#Enterprise" },
  { icon: Building2, name: "Government", color: "from-emerald-600 to-green-800", link: "/#Government" },
  { icon: Scale, name: "Legal", color: "from-yellow-600 to-amber-800", link: "/#Legal" },
  { icon: Shield, name: "Security", color: "from-red-600 to-rose-800", link: "/#Security" },
  { icon: Server, name: "IT & SaaS", color: "from-cyan-500 to-blue-700", link: "/#IT" },
  { icon: Headphones, name: "Support", color: "from-teal-500 to-cyan-700", link: "/#Support" },
];

const CategorySlider = () => {
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
  }, []);

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

  const items = [...CATEGORIES, ...CATEGORIES];

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