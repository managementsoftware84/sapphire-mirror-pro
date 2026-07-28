import { Briefcase, Code2, Globe2, GraduationCap, Handshake, Link2, Megaphone, Network, PenLine, Store, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface JoinRole {
  slug: string; title: string; tagline: string; blurb: string;
  icon: LucideIcon; color: string; perks: string[];
}

export const JOIN_ROLES: JoinRole[] = [
  { slug:"developer", title:"Become a Developer", tagline:"Build products used by 10,000+ businesses",
    blurb:"Join our engineering network and ship ERP, AI and SaaS products for clients in 40+ countries.",
    icon:Code2, color:"from-violet-500 to-purple-600",
    perks:["Remote-first","Paid per milestone","Real client work","Certification"] },
  { slug:"author", title:"Become an Author", tagline:"Sell your source code & templates",
    blurb:"Publish software, source code, plugins and themes. Earn up to 70% on every sale.",
    icon:PenLine, color:"from-cyan-500 to-blue-600",
    perks:["Up to 70% share","Instant publish","Global audience","Author dashboard"] },
  { slug:"vendor", title:"Become a Vendor", tagline:"List your software company",
    blurb:"Onboard as an official vendor. Verified listings, lead flow, enterprise procurement.",
    icon:Store, color:"from-emerald-500 to-teal-600",
    perks:["Verified badge","Qualified leads","Enterprise deals","Dedicated manager"] },
  { slug:"reseller", title:"Become a Reseller", tagline:"Resell 250+ products in your region",
    blurb:"Wholesale pricing on the full catalog. White-label rights and marketing kits.",
    icon:Network, color:"from-orange-500 to-amber-600",
    perks:["Wholesale pricing","White-label","Marketing kits","Territory rights"] },
  { slug:"franchise", title:"Become a Franchise Partner", tagline:"Run a Software Vala franchise",
    blurb:"Launch a branded franchise in your city with our playbook, training and lead-sharing.",
    icon:Globe2, color:"from-rose-500 to-red-600",
    perks:["Proven playbook","Full training","Lead sharing","Exclusive territory"] },
  { slug:"affiliate", title:"Become an Affiliate", tagline:"Up to 30% recurring commission",
    blurb:"Share your referral link. Real-time tracking, monthly payouts, lifetime attribution.",
    icon:Link2, color:"from-sky-500 to-indigo-600",
    perks:["30% commission","Lifetime attribution","Monthly payouts","Live tracking"] },
  { slug:"influencer", title:"Become an Influencer", tagline:"Partner with a global software brand",
    blurb:"Collaborate on launches, reviews and tutorials with free product access and rev-share.",
    icon:Megaphone, color:"from-pink-500 to-fuchsia-600",
    perks:["Free products","Sponsorships","Revenue share","Early launches"] },
  { slug:"sales-partner", title:"Become a Sales Partner", tagline:"Close deals, earn commissions",
    blurb:"Earn on every deal you close. Demos, collateral and pre-sales engineers provided.",
    icon:TrendingUp, color:"from-green-500 to-emerald-600",
    perks:["High commissions","Pre-sales support","Demo environments","CRM access"] },
  { slug:"careers", title:"Careers / Apply for Job", tagline:"Full-time roles across teams",
    blurb:"Open positions in engineering, design, sales and operations. Grow with a product-first company.",
    icon:Briefcase, color:"from-blue-500 to-cyan-600",
    perks:["Competitive salary","Learning budget","Health cover","Stock options"] },
  { slug:"internship", title:"Internship Program", tagline:"3-6 month paid internships",
    blurb:"Structured program for students and freshers with real projects and senior mentors.",
    icon:GraduationCap, color:"from-yellow-500 to-orange-600",
    perks:["Paid stipend","Senior mentors","Real projects","PPO available"] },
  { slug:"partnership", title:"Partnership Program", tagline:"Strategic alliances & integrations",
    blurb:"Technology partnerships, API integrations and co-selling alliances for global builders.",
    icon:Handshake, color:"from-indigo-500 to-violet-600",
    perks:["Co-selling","API access","Joint marketing","Solution architects"] },
];

export const findRole = (slug: string): JoinRole => JOIN_ROLES.find((r) => r.slug === slug) ?? JOIN_ROLES[8];
