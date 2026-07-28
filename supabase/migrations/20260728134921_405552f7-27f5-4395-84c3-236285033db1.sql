-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','editor','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Bootstrap: first authenticated user becomes admin
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid; existing int;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT count(*) INTO existing FROM public.user_roles WHERE role = 'admin';
  IF existing = 0 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (uid, 'admin');
    RETURN true;
  END IF;
  RETURN public.has_role(uid, 'admin');
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Hero slides (single source of truth for the homepage hero carousel)
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  kicker text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  cta_primary text NOT NULL,
  cta_secondary text NOT NULL,
  cta_link text NOT NULL DEFAULT '/demos',
  gradient text NOT NULL,
  icon_name text NOT NULL,
  accent text NOT NULL,
  position int NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  unpublish_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_slides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero public read" ON public.hero_slides FOR SELECT TO anon, authenticated
  USING (visible = true AND (published_at IS NULL OR published_at <= now()) AND (unpublish_at IS NULL OR unpublish_at > now()));
CREATE POLICY "hero admin read all" ON public.hero_slides FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "hero admin insert" ON public.hero_slides FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "hero admin update" ON public.hero_slides FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "hero admin delete" ON public.hero_slides FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_hero_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed with current homepage hero slides verbatim (mirrors HeroCarousel.tsx)
INSERT INTO public.hero_slides (slug, kicker, title, subtitle, cta_primary, cta_secondary, cta_link, gradient, icon_name, accent, position, visible, published_at) VALUES
('catalog','Mega Catalog','204+ Software Solutions Across 55 Industries','Every category. Every industry. One marketplace built for scale.','Browse Catalog','View Categories','/demos','from-cyan-600 via-blue-700 to-indigo-800','Boxes','text-cyan-200',10,true,now()),
('lifetime','Limited Offer','Lifetime Access Starting $249','Pay once. Own forever. Zero recurring fees — no advance payment.','Claim Lifetime Deal','See Pricing','/demos','from-amber-500 via-orange-600 to-red-700','Crown','text-amber-100',20,true,now()),
('delivery','White Glove','2-Hour Delivery, Free Installation','Approved & provisioned in 120 minutes — with 1 year of free support.','Start Now','Watch Demo','/demos','from-fuchsia-600 via-purple-700 to-violet-800','Rocket','text-fuchsia-100',30,true,now()),
('ai','AI Native','Automation Copilots Built-in','Every product ships with AI recommendations, compare & sales assistants.','Explore AI Zone','Try Copilot','/demos','from-emerald-500 via-teal-600 to-cyan-700','Sparkles','text-emerald-100',40,true,now()),
('pos','Featured','Restaurant POS System','Complete billing, inventory & kitchen management. Try the live demo now!','Try Demo','Buy Now','/demos','from-orange-600 via-red-600 to-pink-700','Utensils','text-orange-100',50,true,now()),
('erp','Featured','School ERP & LMS','Student management, attendance, fees & online classes — all-in-one.','Try Demo','Buy Now','/demos','from-blue-600 via-indigo-700 to-purple-800','GraduationCap','text-blue-100',60,true,now()),
('hms','Featured','Hospital Management','OPD, IPD, pharmacy, lab reports & billing. Built for modern clinics.','Try Demo','Buy Now','/demos','from-emerald-600 via-teal-700 to-cyan-800','Stethoscope','text-emerald-100',70,true,now()),
('ecom','Featured','E-Commerce Platform','Launch your online store in minutes. Multi-vendor, payments & delivery.','Try Demo','Buy Now','/demos','from-purple-600 via-violet-700 to-fuchsia-800','Store','text-purple-100',80,true,now()),
('crm','Featured','CRM & Sales Automation','Manage leads, customers & sales pipeline with AI-powered insights.','Try Demo','Buy Now','/demos','from-cyan-600 via-blue-700 to-indigo-800','Users','text-cyan-100',90,true,now());

-- Hardening (second migration from source repo)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
-- authenticated keeps execute (needed for bootstrap)

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;