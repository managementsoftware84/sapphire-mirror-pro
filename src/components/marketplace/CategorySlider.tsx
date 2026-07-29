import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, GraduationCap, Stethoscope, Utensils, Hotel, Home, Car, Plane,
  CreditCard, Factory, Users, Truck, Building, Megaphone, Wallet, Briefcase,
  ShoppingBag, Scale, Shield, Server, Headphones, Building2, ChevronLeft, ChevronRight
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [paused, setPaused] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let dir = 1;
    let raf = 0;
    let last = performance.now();
    const speed = 40; // px/sec — silky continuous marquee
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!isDragging && !paused) {
        const max = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= max - 2) dir = -1;
        else if (el.scrollLeft <= 2) dir = 1;
        el.scrollLeft += dir * speed * dt;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isDragging, paused]);

  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <section
      className="relative py-6 bg-gradient-to-b from-[#0a1628] via-[#0d1e36]/70 to-transparent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 relative" style={{ perspective: 1000 }}>
        {canScrollLeft && (
          <button onClick={() => scroll(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl border border-white/20">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl border border-white/20">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={(e) => { setIsDragging(true); setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0)); setScrollLeft(scrollRef.current?.scrollLeft || 0); }}
          onMouseMove={(e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - (scrollRef.current?.offsetLeft || 0); if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5; }}
          onMouseUp={() => setIsDragging(false)}
          className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-10 py-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.name}
                href={cat.link}
                onClick={(e) => isDragging && e.preventDefault()}
                className="flex-shrink-0"
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
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
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;